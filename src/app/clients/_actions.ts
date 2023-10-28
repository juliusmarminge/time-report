"use server";

import { revalidateTag } from "next/cache";
import { Temporal } from "@js-temporal/polyfill";
import { and, eq } from "drizzle-orm";
import { utapi } from "uploadthing/server";
import type { Input } from "valibot";
import { parseAsync } from "valibot";

import { db } from "~/db";
import { client, period, timeslot } from "~/db/schema";
import { currentUser } from "~/lib/auth";
import type { CurrencyCode } from "../../lib/currencies";
import { normalizeAmount } from "../../lib/currencies";
import { createClientSchema, updateClientSchema } from "./_validators";

export async function createClient(props: Input<typeof createClientSchema>) {
  const user = await currentUser();
  if (!user) return;

  const input = await parseAsync(createClientSchema, props);

  const currencyCode = input.currency as CurrencyCode;
  const normalized = normalizeAmount(input.defaultCharge, currencyCode);

  const newClient = await db.insert(client).values({
    name: input.name,
    currency: currencyCode,
    defaultCharge: normalized,
    defaultBillingPeriod: input.defaultBillingPeriod,
    image: input.image,
    tenantId: user.id,
  });

  // FIXME: mysql2 and pscale type interops
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const newClientId: number = Array.isArray(newClient)
    ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      newClient[0].insertId
    : parseInt(newClient.insertId);

  const now = Temporal.Now.plainDateISO();

  await db.insert(period).values({
    clientId: newClientId,
    startDate:
      input.defaultBillingPeriod === "monthly"
        ? now.with({ day: 1 })
        : now.with({ day: now.day - now.dayOfWeek }),
    endDate:
      input.defaultBillingPeriod === "monthly"
        ? now.with({ day: now.daysInMonth })
        : input.defaultBillingPeriod === "biweekly"
        ? now.add({ days: 13 - now.dayOfWeek })
        : now.add({ days: 6 - now.dayOfWeek }),
    tenantId: user.id,
  });

  revalidateTag("clients");
  revalidateTag("periods");
}

export async function updateClient(
  clientId: number,
  props: Input<typeof updateClientSchema>,
) {
  const user = await currentUser();
  if (!user) return;

  const existing = await db.query.client.findFirst({
    columns: { id: true },
    where: and(eq(client.tenantId, user.id), eq(client.id, clientId)),
  });
  if (!existing) throw new Error("Unauthorized");

  const input = await parseAsync(updateClientSchema, props);

  const currencyCode = input.currency as CurrencyCode;
  const normalized = normalizeAmount(input.defaultCharge, currencyCode);

  await db
    .update(client)
    .set({
      name: input.name,
      currency: currencyCode,
      defaultCharge: normalized,
      defaultBillingPeriod: input.defaultBillingPeriod,
    })
    .where(eq(client.id, clientId));

  revalidateTag("clients");
}

export async function deleteImageFromUT(imageUrl: string | null | undefined) {
  const user = await currentUser();
  if (!user) return;

  const imageKey = imageUrl?.split("/f/")[1];
  if (imageKey) {
    await utapi.deleteFiles([imageKey]);
  }
}

export async function deleteClient(props: { id: number }) {
  const user = await currentUser();
  if (!user) return;

  const existing = await db.query.client.findFirst({
    columns: { id: true, image: true },
    where: and(eq(client.tenantId, user.id), eq(client.id, props.id)),
  });
  if (!existing) throw new Error("Unauthorized");

  await Promise.all([
    db.delete(client).where(eq(client.id, props.id)),
    db.delete(period).where(eq(period.clientId, props.id)),
    db.delete(timeslot).where(eq(timeslot.clientId, props.id)),
    deleteImageFromUT(existing.image),
  ]);

  revalidateTag("clients");
}
