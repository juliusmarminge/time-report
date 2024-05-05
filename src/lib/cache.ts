import "server-only";

import { unstable_cache } from "next/cache";

import { currentUser } from "~/auth";
import { tson } from "~/lib/tson";

export const CACHE_TAGS = {
  CLIENTS: "clients",
  TIMESLOTS: "timeslots",
  PERIODS: "periods",
} as const;
type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export async function withUnstableCache<
  T extends (...args: any[]) => any,
>(opts: { fn: T; args: Parameters<T>; tags: CacheTag[] }) {
  const user = await currentUser();
  const allTags = user ? [...opts.tags, user.id] : opts.tags;

  const cachedResult = await unstable_cache(
    async (...args) => {
      const result = await opts.fn(...args);
      return tson.serialize(result);
    },
    allTags,
    { tags: opts.tags },
  )(...opts.args);

  return tson.deserialize<Awaited<ReturnType<T>>>(cachedResult);
}
