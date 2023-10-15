"use server";

import { revalidateTag } from "next/cache";
import { and, eq } from "drizzle-orm";
import { parseAsync } from "valibot";
import type { Input } from "valibot";

import { db } from "~/db";
import { getOpenPeriods } from "~/db/getters";
import { period, timeslot } from "~/db/schema";
import { currentUser } from "~/lib/auth";
import type { CurrencyCode } from "~/lib/currencies";
import { currencies } from "~/lib/currencies";
import {
  closePeriodSchema,
  reportTimeSchema,
  updateSchema,
} from "./_validators";

export async function reportTime(props: Input<typeof reportTimeSchema>) {
  const user = await currentUser();
  if (!user) return;

  const input = await parseAsync(reportTimeSchema, props);

  const currency = input.currency
    ? currencies[input.currency as CurrencyCode]
    : currencies.USD;
  const normalizedAmount =
    input.chargeRate * currency.base ** currency.exponent;

  const slotPeriod = await db.query.period.findFirst({
    where: and(
      eq(period.status, "open"),
      eq(period.tenantId, user.id),
      eq(period.clientId, input.clientId),
    ),
  });
  if (!slotPeriod) {
    // TODO: Create a new one
    throw new Error("No open period found");
  }

  console.log("Inserting timeslot for period", slotPeriod.id);

  await db.insert(timeslot).values({
    date: input.date,
    duration: String(input.duration),
    chargeRate: normalizedAmount,
    currency: input.currency as CurrencyCode,
    description: input.description,
    clientId: input.clientId,
    tenantId: user.id,
    periodId: slotPeriod.id,
  });

  revalidateTag("timeslots");
  revalidateTag("periods");
}

export async function deleteTimeslot(id: number) {
  const user = await currentUser();
  if (!user) return;

  await db.delete(timeslot).where(eq(timeslot.id, id));

  revalidateTag("timeslots");
  revalidateTag("periods");
}

export async function updateTimeslot(
  id: number,
  props: Input<typeof updateSchema>,
) {
  const user = await currentUser();
  if (!user) return;

  const input = await parseAsync(updateSchema, props);
  const currency = input.currency
    ? currencies[input.currency as CurrencyCode]
    : currencies.USD;
  const normalizedAmount =
    input.chargeRate * currency.base ** currency.exponent;

  console.log({ charged: input.chargeRate, normalized: normalizedAmount });

  await db
    .update(timeslot)
    .set({
      currency: currency.code,
      duration: String(input.duration),
      chargeRate: normalizedAmount,
    })
    .where(eq(timeslot.id, id));

  revalidateTag("timeslots");
  revalidateTag("periods");
}

export async function closePeriod(
  id: number,
  props: Input<typeof closePeriodSchema>,
) {
  const user = await currentUser();
  if (!user) return;

  const input = await parseAsync(closePeriodSchema, props);

  const openPeriods = await getOpenPeriods(user.id);
  const p = openPeriods.find((p) => p.id === id);

  if (!p) {
    throw new Error("Period not found");
  }

  await db
    .update(period)
    .set({ status: "closed", closedAt: new Date() })
    .where(eq(period.id, id));

  if (input.openNewPeriod) {
    await db.insert(period).values({
      status: "open",
      tenantId: user.id,
      clientId: input.clientId,
      startDate: input.periodStart,
      endDate: input.periodEnd,
    });
  }

  revalidateTag("periods");
  revalidateTag("clients");
}
