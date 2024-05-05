import type { Adapter, AdapterAccount } from "next-auth/adapters";
import type { EmailConfig } from "next-auth/providers";
import { e, edgedb } from "~/edgedb";

export const edgedbAdapter = {
  createUser: async ({ id, ...data }) => {
    const user = await e
      .select(e.insert(e.User, { ...data }), (user) => user["*"])
      .run(edgedb);
    return user;
  },
  deleteUser: async (id) => {
    await e
      .delete(e.User, (user) => ({
        filter_single: e.op(user.id, "=", e.uuid(id)),
      }))
      .run(edgedb);
  },
  getUser: async (id) => {
    const user = await e
      .select(e.User, (user) => ({
        ...user["*"],
        filter_single: e.op(user.id, "=", e.uuid(id)),
      }))
      .run(edgedb);
    return user;
  },
  getUserByAccount: async ({ provider, providerAccountId }) => {
    const account = await e
      .select(e.Account, (account) => ({
        user: e.User["*"],
        filter_single: e.op(
          e.op(account.provider, "=", provider),
          "and",
          e.op(account.providerAccountId, "=", providerAccountId),
        ),
      }))
      .run(edgedb);
    return account?.user ?? null;
  },
  getUserByEmail: async (email) => {
    const user = await e
      .select(e.User, (user) => ({
        ...user["*"],
        filter_single: e.op(user.email, "=", email),
      }))
      .run(edgedb);
    return user;
  },
  updateUser: async ({ id, ...data }) => {
    const user = await e
      .select(
        e.update(e.User, (user) => ({
          set: data,
          filter_single: e.op(user.id, "=", e.uuid(id)),
        })),
        (user) => user["*"],
      )
      .run(edgedb);
    if (!user) throw "user not found";
    return user;
  },

  createSession: async ({ userId, ...data }) => {
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
      .run(edgedb);
    return session;
  },
  deleteSession: async (sessionToken) => {
    await e
      .delete(e.Session, (session) => ({
        filter_single: e.op(session.sessionToken, "=", sessionToken),
      }))
      .run(edgedb);
  },
  getSessionAndUser: async (sessionToken) => {
    const session = await e
      .select(e.Session, (session) => ({
        ...session["*"],
        user: e.User["*"],
        filter_single: e.op(session.sessionToken, "=", sessionToken),
      }))
      .run(edgedb);
    if (!session) return null;
    const { user, ...sessionData } = session;
    return { user, session: sessionData };
  },
  updateSession: async ({ sessionToken, ...data }) => {
    const session = await e
      .select(
        e.update(e.Session, (session) => ({
          set: data,
          filter_single: e.op(session.sessionToken, "=", sessionToken),
        })),
        (session) => session["*"],
      )
      .run(edgedb);
    if (!session) throw "session not found";
    return session;
  },

  linkAccount: async ({ userId, ...data }) => {
    await e
      .insert(e.Account, {
        ...data,
        user: e.select(e.User, (user) => ({
          filter_single: e.op(user.id, "=", e.uuid(userId)),
        })),
      })
      .run(edgedb);
  },
  unlinkAccount: async ({ provider, providerAccountId }) => {
    await e
      .delete(e.Account, (account) => ({
        filter_single: e.op(
          e.op(account.provider, "=", provider),
          "and",
          e.op(account.providerAccountId, "=", providerAccountId),
        ),
      }))
      .run(edgedb);
  },
  getAccount: async (providerAccountId, provider) => {
    const account = await e
      .select(e.Account, (account) => ({
        ...account["*"],
        filter_single: e.op(
          e.op(account.provider, "=", provider),
          "and",
          e.op(account.providerAccountId, "=", providerAccountId),
        ),
      }))
      .run(edgedb);
    return (account as unknown as AdapterAccount) ?? null;
  },

  createVerificationToken: async (data) => {
    const token = await e
      .select(
        e.insert(e.VerificationToken, {
          ...data,
        }),
        (vt) => vt["*"],
      )
      .run(edgedb);
    return token;
  },
  useVerificationToken: async ({ identifier, token }) => {
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
      .run(edgedb);
    return usedToken;
  },

  createAuthenticator: async ({ userId, ...data }) => {
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
      .run(edgedb);
    const { id: _, ...rest } = authenticator;
    return rest;
  },
  getAuthenticator: async (credentialId) => {
    const authenticator = await e
      .select(e.Authenticators, (auth) => ({
        ...auth["*"],
        filter_single: e.op(auth.credentialID, "=", credentialId),
      }))
      .run(edgedb);
    return authenticator ?? null;
  },
  listAuthenticatorsByUserId: async (userId) => {
    const auths = await e
      .select(e.Authenticators, (auth) => ({
        ...auth["*"],
        filter: e.op(auth.userId, "=", e.uuid(userId)),
      }))
      .run(edgedb);
    return auths;
  },
  updateAuthenticatorCounter: async (credentialId, counter) => {
    const authenticator = await e
      .select(
        e.update(e.Authenticators, (auth) => ({
          set: { counter },
          filter_single: e.op(auth.credentialID, "=", credentialId),
        })),
        (auth) => auth["*"],
      )
      .run(edgedb);
    if (!authenticator) throw "authenticator not found";
    return authenticator;
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
