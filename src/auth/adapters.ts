import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq } from "drizzle-orm";
import type {
  Adapter,
  AdapterAccount,
  AdapterAuthenticator,
} from "next-auth/adapters";
import type { EmailConfig } from "next-auth/providers";
import { db } from "~/db/client";
import { accounts, authenticators, sessions, users } from "~/db/schema";

/**
 * Basically same as the original one but it uses my tables so it'll include
 * fields like `user.defaultCurrency` etc.
 *
 * @see https://github.com/nextauthjs/next-auth/pull/8561
 */
export const drizzleAdapter = {
  ...DrizzleAdapter(db),
  getSessionAndUser: async (data) => {
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
  getAccount: async (providerAccountId, provider) => {
    const [account] = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, provider),
          eq(accounts.providerAccountId, providerAccountId),
        ),
      );
    return (account as AdapterAccount) ?? null;
  },
  createAuthenticator: async (data) => {
    const id = crypto.randomUUID();
    console.log(data);
    await db.insert(authenticators).values({
      id,
      ...data,
    });
    const [authenticator] = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.id, id));
    const { transports, id: _, ...rest } = authenticator;
    return { ...rest, transports: transports ?? undefined };
  },
  getAuthenticator: async (credentialId) => {
    const [authenticator] = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.credentialID, credentialId));
    return (authenticator as AdapterAuthenticator) ?? null;
  },
  listAuthenticatorsByUserId: async (userId) => {
    const auths = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.userId, userId));
    return auths.map((a) => ({
      ...a,
      transports: a.transports ?? undefined,
    }));
  },
  updateAuthenticatorCounter: async (credentialId, counter) => {
    await db
      .update(authenticators)
      .set({ counter })
      .where(eq(authenticators.credentialID, credentialId));
    const [authenticator] = await db
      .select()
      .from(authenticators)
      .where(eq(authenticators.credentialID, credentialId));
    return (authenticator as AdapterAuthenticator) ?? null;
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
