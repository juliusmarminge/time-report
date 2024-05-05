"use server";

import { revalidateTag } from "next/cache";

import { e, edgedb } from "~/edgedb";
import type { CurrencyCode } from "../monetary/math";
import { currentUser } from "~/auth";

export async function setDefaultCurrency(currency: CurrencyCode) {
  const _user = await currentUser();
  if (!_user) throw new Error("Unauthorized");

  await e
    .update(e.User, (user) => ({
      set: { defaultCurrency: currency },
      filter_single: e.op(user.id, "=", e.uuid(_user.id)),
    }))
    .run(edgedb);

  revalidateTag("/");
}
