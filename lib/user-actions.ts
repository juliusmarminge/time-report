"use server";

import { revalidateTag } from "next/cache";

import { db } from "~/db/client";
import { users } from "~/db/schema";
import type { CurrencyCode } from "./monetary";

export async function setDefaultCurrency(currency: CurrencyCode) {
  await db.update(users).set({
    defaultCurrency: currency,
  });

  revalidateTag("/");
}
