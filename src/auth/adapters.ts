import type { Adapter, AdapterAccount } from "next-auth/adapters";
import type { EmailConfig } from "next-auth/providers";
import { db, e } from "~/edgedb";

import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("@auth/edgedb-adapter");

export const edgedbAdapter = {
  createUser: ({ id, ...data }) =>
    tracer.startActiveSpan("createUser", async (span) => {
      span.setAttributes({ id });
      const user = await e
        .select(e.insert(e.User, { ...data }), (user) => user["*"])
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(user)));
      span.end();
      return user;
    }),
  deleteUser: (id) => db.execute("delete User filter .id = <uuid>$id", { id }),
  getUser: (id) =>
    tracer.startActiveSpan("getUser", async (span) => {
      span.setAttributes({ id });
      const user = await e
        .select(e.User, (user) => ({
          ...user["*"],
          filter_single: e.op(user.id, "=", e.uuid(id)),
        }))
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(user ?? {})));
      span.end();
      return user;
    }),
  getUserByAccount: ({ provider, providerAccountId }) =>
    tracer.startActiveSpan("getUserByAccount", async (span) => {
      span.setAttributes({ provider, providerAccountId });
      const account = await e
        .select(e.Account, (account) => ({
          user: e.User["*"],
          filter_single: e.op(
            e.op(account.provider, "=", provider),
            "and",
            e.op(account.providerAccountId, "=", providerAccountId),
          ),
        }))
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(account?.user ?? {})));
      span.end();
      return account?.user ?? null;
    }),
  getUserByEmail: (email) =>
    tracer.startActiveSpan("getUserByEmail", async (span) => {
      span.setAttributes({ email });
      const user = await e
        .select(e.User, (user) => ({
          ...user["*"],
          filter_single: e.op(user.email, "=", email),
        }))
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(user ?? {})));
      span.end();
      return user;
    }),
  updateUser: ({ id, ...data }) =>
    tracer.startActiveSpan("updateUser", async (span) => {
      span.setAttributes({ id });
      const user = await e
        .select(
          e.update(e.User, (user) => ({
            set: data,
            filter_single: e.op(user.id, "=", e.uuid(id)),
          })),
          (user) => user["*"],
        )
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(user ?? {})));
      span.end();
      if (!user) throw "user not found";
      return user;
    }),

  createSession: async ({ userId, ...data }) => {
    return tracer.startActiveSpan("createSession", async (span) => {
      span.setAttributes({ userId });
      const session = await e
        .select(
          e.insert(e.Session, {
            ...data,
            user: e.select(e.User, (user) => ({
              filter_single: e.op(user.id, "=", e.uuid(userId)),
            })),
          }),
          (session) => session["*"],
        )
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(session ?? {})));
      span.end();
      return session;
    });
  },
  deleteSession: (token) =>
    tracer.startActiveSpan("deleteSession", async (span) => {
      span.setAttributes({ token });
      await db.execute("delete Session filter .sessionToken = <uuid>$token", {
        token,
      });
      span.end();
    }),
  getSessionAndUser: (sessionToken) =>
    tracer.startActiveSpan("getSessionAndUser", async (span) => {
      span.setAttributes({ sessionToken });
      const session = await e
        .select(e.Session, (session) => ({
          ...session["*"],
          user: e.User["*"],
          filter_single: e.op(session.sessionToken, "=", sessionToken),
        }))
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(session ?? {})));
      span.end();
      if (!session) return null;
      const { user, ...sessionData } = session;
      return { user, session: sessionData };
    }),
  updateSession: ({ sessionToken, ...data }) =>
    tracer.startActiveSpan("updateSession", async (span) => {
      span.setAttributes({ sessionToken });
      const session = await e
        .select(
          e.update(e.Session, (session) => ({
            set: data,
            filter_single: e.op(session.sessionToken, "=", sessionToken),
          })),
          (session) => session["*"],
        )
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(session ?? {})));
      span.end();
      if (!session) throw "session not found";
      return session;
    }),

  linkAccount: async ({ userId, ...data }) => {
    return tracer.startActiveSpan("linkAccount", async (span) => {
      span.setAttributes({ userId });
      const res = await e
        .insert(e.Account, {
          ...data,
          user: e.select(e.User, (user) => ({
            filter_single: e.op(user.id, "=", e.uuid(userId)),
          })),
        })
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(res ?? {})));
      span.end();
    });
  },
  unlinkAccount: async ({ provider, providerAccountId }) => {
    await db.execute(
      "delete Account filter .provider = $provider and .providerAccountId = $providerAccountId",
      { provider, providerAccountId },
    );
  },
  getAccount: (providerAccountId, provider) =>
    tracer.startActiveSpan("getAccount", async (span) => {
      span.setAttributes({ provider, providerAccountId });
      const account = await e
        .select(e.Account, (account) => ({
          ...account["*"],
          filter_single: e.op(
            e.op(account.provider, "=", provider),
            "and",
            e.op(account.providerAccountId, "=", providerAccountId),
          ),
        }))
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(account ?? {})));
      span.end();
      return account as unknown as AdapterAccount | null;
    }),

  createVerificationToken: (data) =>
    tracer.startActiveSpan("createVerificationToken", async (span) => {
      span.setAttributes(JSON.parse(JSON.stringify(data)));
      const token = await e
        .select(
          e.insert(e.VerificationToken, {
            ...data,
          }),
          (vt) => vt["*"],
        )
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(token ?? {})));
      span.end();
      return token;
    }),
  useVerificationToken: ({ identifier, token }) =>
    tracer.startActiveSpan("useVerificationToken", async (span) => {
      span.setAttributes({ identifier, token });
      const usedToken = await e
        .select(
          e.delete(e.VerificationToken, (vt) => ({
            filter_single: e.op(
              e.op(vt.identifier, "=", identifier),
              "and",
              e.op(vt.token, "=", token),
            ),
          })),
          (vt) => vt["*"],
        )
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(usedToken ?? {})));
      span.end();
      return usedToken;
    }),

  createAuthenticator: ({ userId, ...data }) =>
    tracer.startActiveSpan("createAuthenticator", async (span) => {
      span.setAttributes({ userId });
      const authenticator = await e
        .select(
          e.insert(e.Authenticators, {
            ...data,
            user: e.select(e.User, (user) => ({
              filter_single: e.op(user.id, "=", e.uuid(userId)),
            })),
          }),
          (auth) => auth["*"],
        )
        .run(db);
      const { id: _, ...rest } = authenticator;
      span.setAttributes(JSON.parse(JSON.stringify(rest)));
      span.end();
      return rest;
    }),
  getAuthenticator: (credentialId) =>
    tracer.startActiveSpan("getAuthenticator", async (span) => {
      span.setAttributes({ credentialId });
      const authenticator = await e
        .select(e.Authenticators, (auth) => ({
          ...auth["*"],
          filter_single: e.op(auth.credentialID, "=", credentialId),
        }))
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(authenticator ?? {})));
      span.end();
      return authenticator;
    }),
  listAuthenticatorsByUserId: (userId) =>
    tracer.startActiveSpan("listAuthenticatorsByUserId", async (span) => {
      span.setAttributes({ userId });
      const authenticators = await e
        .select(e.Authenticators, (auth) => ({
          ...auth["*"],
          filter: e.op(auth.userId, "=", e.uuid(userId)),
        }))
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(authenticators)));
      span.end();
      return authenticators;
    }),
  updateAuthenticatorCounter: (credentialId, counter) =>
    tracer.startActiveSpan("updateAuthenticatorCounter", async (span) => {
      span.setAttributes({ credentialId, counter });
      const authenticator = await e
        .select(
          e.update(e.Authenticators, (auth) => ({
            set: { counter },
            filter_single: e.op(auth.credentialID, "=", credentialId),
          })),
          (auth) => auth["*"],
        )
        .run(db);
      span.setAttributes(JSON.parse(JSON.stringify(authenticator ?? {})));
      span.end();
      if (!authenticator) throw "authenticator not found";
      return authenticator;
    }),
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
