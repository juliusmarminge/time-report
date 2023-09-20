"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { parseAsync } from "valibot";
import type { Input } from "valibot";

import { db } from "~/db";
import { timeslot } from "~/db/schema";
import { currentUser } from "~/lib/auth";
import type { CurrencyCode } from "~/lib/currencies";
import { currencies } from "~/lib/currencies";
import { reportTimeSchema, updateSchema } from "./_validators";

export async function reportTime(props: Input<typeof reportTimeSchema>) {
  const user = await currentUser();
  if (!user) return;

  const input = await parseAsync(reportTimeSchema, props);

  const currency = input.currency
    ? currencies[input.currency as CurrencyCode]
    : currencies.USD;
  const normalizedAmount =
    input.chargeRate * currency.base ** currency.exponent;

  console.log({ charged: input.chargeRate, normalized: normalizedAmount });

  await db.insert(timeslot).values({
    date: input.date,
    duration: String(input.duration),
    chargeRate: normalizedAmount,
    currency: input.currency as CurrencyCode,
    description: input.description,
    clientId: input.clientId,
    tenantId: user.id,
  });

  revalidateTag("timeslots");
}

export async function deleteTimeslot(id: number) {
  await db.delete(timeslot).where(eq(timeslot.id, id));

  revalidateTag("timeslots");
}

export async function updateTimeslot(
  id: number,
  props: Input<typeof updateSchema>,
) {
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
}
