"use server";

import { revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
// import { utapi } from "uploadthing/server";
import type { Input } from "valibot";
import { parseAsync } from "valibot";

import { db } from "~/db";
import { client } from "~/db/schema";
import type { CurrencyCode } from "../../lib/currencies";
import { currencies } from "../../lib/currencies";
import { createClientSchema } from "./_validators";

export async function createClient(props: Input<typeof createClientSchema>) {
  const input = await parseAsync(createClientSchema, props);

  console.log("input", input);

  const currency = input.currency
    ? currencies[input.currency as CurrencyCode]
    : currencies.USD;
  const normalizedAmount =
    input.defaultCharge * currency.base ** currency.exponent;

  // const image = await utapi.uploadFiles(input.image as File);
  // const imageUrl = image.data ? image.data.url : null;
  // if (!imageUrl) throw new Error("Image upload failed.");

  await db.insert(client).values({
    name: input.name,
    currency: input.currency as CurrencyCode,
    defaultCharge: normalizedAmount,
    image: "", // imageUrl,
  });

  revalidateTag("/");
}

export async function deleteClient(props: { id: number }) {
  await db.delete(client).where(eq(client.id, props.id));

  revalidateTag("/");
}
