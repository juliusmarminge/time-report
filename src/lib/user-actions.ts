"use server";

import { revalidateTag } from "next/cache";

import { db } from "~/db";
import { users } from "~/db/schema";
import type { CurrencyCode } from "./currencies";

export async function setDefaultCurrency(currency: CurrencyCode) {
  await db.update(users).set({
    defaultCurrency: currency,
  });

  revalidateTag("/");
}
