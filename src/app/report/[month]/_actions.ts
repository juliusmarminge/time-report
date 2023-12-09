"use server";

import { revalidateTag } from "next/cache";
import { Temporal } from "@js-temporal/polyfill";
import { and, eq } from "drizzle-orm";
import { parseAsync } from "valibot";

import { db } from "~/db/client";
import { getOpenPeriods } from "~/db/getters";
import { client, period, timeslot } from "~/db/schema";
import { currentUser } from "~/lib/auth";
import type { CurrencyCode } from "~/lib/currencies";
import { normalizeAmount } from "~/lib/currencies";
import {
  closePeriodSchema,
  reportTimeSchema,
  updateSchema,
} from "./_validators";

export async function reportTime(props: unknown) {
  const user = await currentUser();
  if (!user) return;

  const input = await parseAsync(reportTimeSchema, props);

  const existingClient = await db.query.client.findFirst({
    where: and(eq(client.tenantId, user.id), eq(client.id, input.clientId)),
  });
  if (!existingClient) throw new Error("Unauthorized");

  const currencyCode = input.currency as CurrencyCode;
  const normalized = normalizeAmount(input.chargeRate, currencyCode);

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
    date: Temporal.PlainDate.from(input.date),
    duration: String(input.duration),
    chargeRate: normalized,
    currency: currencyCode,
    description: input.description,
    clientId: input.clientId,
    tenantId: user.id,
    periodId: slotPeriod.id,
  });

  revalidateTag("timeslots");
  revalidateTag("periods");
  revalidateTag("clients");
}

export async function deleteTimeslot(id: number) {
  const user = await currentUser();
  if (!user) return;

  const existing = await db.query.timeslot.findFirst({
    where: and(eq(timeslot.tenantId, user.id), eq(timeslot.id, id)),
  });
  if (!existing) throw new Error("Unauthorized");

  await db.delete(timeslot).where(eq(timeslot.id, id));

  revalidateTag("timeslots");
  revalidateTag("periods");
  revalidateTag("clients");
}

export async function updateTimeslot(id: number, props: unknown) {
  const user = await currentUser();
  if (!user) return;

  const existing = await db.query.timeslot.findFirst({
    where: and(eq(timeslot.tenantId, user.id), eq(timeslot.id, id)),
  });
  if (!existing) throw new Error("Unauthorized");

  const input = await parseAsync(updateSchema, props);

  const currencyCode = input.currency as CurrencyCode;
  const normalized = normalizeAmount(input.chargeRate, currencyCode);

  await db
    .update(timeslot)
    .set({
      currency: currencyCode,
      duration: String(input.duration),
      chargeRate: normalized,
    })
    .where(eq(timeslot.id, id));

  revalidateTag("timeslots");
  revalidateTag("periods");
  revalidateTag("clients");
}

export async function closePeriod(id: number, props: unknown) {
  const user = await currentUser();
  if (!user) return;

  const openPeriods = await getOpenPeriods(user.id);
  const p = openPeriods.find((p) => p.id === id);
  if (!p) throw new Error("Unauthorized");

  const input = await parseAsync(closePeriodSchema, props);

  await db
    .update(period)
    .set({ status: "closed", closedAt: new Date() })
    .where(eq(period.id, id));

  if (input.openNewPeriod) {
    await db.insert(period).values({
      status: "open",
      tenantId: user.id,
      clientId: input.clientId,
      startDate: Temporal.PlainDate.from(input.periodStart),
      endDate: Temporal.PlainDate.from(input.periodEnd),
    });
  }

  revalidateTag("periods");
  revalidateTag("clients");
}
