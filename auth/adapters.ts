import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import type { Adapter } from "next-auth/adapters";
import type { EmailConfig } from "next-auth/providers";
import { db } from "~/db/client";
import { sessions, users } from "~/db/schema";

/**
 * Basically same as the original one but it uses my tables so it'll include
 * fields like `user.defaultCurrency` etc.
 *
 * @see https://github.com/nextauthjs/next-auth/pull/8561
 */
export const drizzleAdapter = {
  ...DrizzleAdapter(db),
  async getSessionAndUser(data) {
    const sessionAndUsers = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .where(eq(sessions.sessionToken, data))
      .innerJoin(users, eq(users.id, sessions.userId));

    return sessionAndUsers[0] ?? null;
  },
} satisfies Adapter;

/**
 * Very basic mock provider to have some simple auth for testing
 * when you might not have a intenret connection to use OAuth.
 */
export const mockEmail = {
  id: "email",
  name: "Email",
  type: "email",
  from: "mock@test.com",
  maxAge: 86400,
  generateVerificationToken: () => "supersecret",
  async sendVerificationRequest(opts) {
    await new Promise((r) => setTimeout(r, 500));
    console.log(`[EMAIL LOGIN]: ${opts.identifier} - ${opts.token}`);
  },
  options: {},
} satisfies EmailConfig;
