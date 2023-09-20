"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { utapi } from "uploadthing/server";
import type { Input } from "valibot";
import { parseAsync } from "valibot";

import { db } from "~/db";
import { client } from "~/db/schema";
import { currentUser } from "~/lib/auth";
import type { CurrencyCode } from "../../lib/currencies";
import { currencies } from "../../lib/currencies";
import { createClientSchema, updateClientSchema } from "./_validators";

export async function createClient(props: Input<typeof createClientSchema>) {
  const user = await currentUser();
  if (!user) return;

  const input = await parseAsync(createClientSchema, props);

  const currency = input.currency
    ? currencies[input.currency as CurrencyCode]
    : currencies.USD;
  const normalizedAmount =
    input.defaultCharge * currency.base ** currency.exponent;

  await db.insert(client).values({
    name: input.name,
    currency: input.currency as CurrencyCode,
    defaultCharge: normalizedAmount,
    image: input.image,
    tenantId: user.id,
  });

  revalidateTag("clients");
}

export async function updateClient(
  clientId: number,
  props: Input<typeof updateClientSchema>,
) {
  const user = await currentUser();
  if (!user) return;

  const input = await parseAsync(updateClientSchema, props);

  const currency = input.currency
    ? currencies[input.currency as CurrencyCode]
    : currencies.USD;
  const normalizedAmount =
    input.defaultCharge * currency.base ** currency.exponent;

  await db
    .update(client)
    .set({
      name: input.name,
      currency: input.currency as CurrencyCode,
      defaultCharge: normalizedAmount,
    })
    .where(eq(client.id, clientId));

  revalidateTag("clients");
}

export async function deleteClient(props: { id: number }) {
  const [clientImage] = await db
    .select({ image: client.image })
    .from(client)
    .where(eq(client.id, props.id));
  await db.delete(client).where(eq(client.id, props.id));

  const imageKey = clientImage.image?.split("/f/")[1];
  if (imageKey) {
    await utapi.deleteFiles([imageKey]);
  }

  revalidateTag("clients");
}

export async function deleteImageFromUT(imageUrl: string | undefined) {
  const imageKey = imageUrl?.split("/f/")[1];
  if (imageKey) {
    await utapi.deleteFiles([imageKey]);
  }
}
