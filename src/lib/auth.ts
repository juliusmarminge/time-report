import { redirect } from "next/navigation";
import type { Provider } from "@auth/core/providers";
import Email from "@auth/core/providers/email";
import Github from "@auth/core/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import NextAuth from "next-auth";

import { db } from "~/db";
import { sessions, table, users } from "~/db/schema";

export type { Session } from "@auth/core/types";

export const providers = [{ name: "github", handler: Github }] as const;
export type OAuthProviders = (typeof providers)[number]["name"];

declare module "@auth/core/types" {
  interface Session {
    user: InferSelectModel<typeof users>;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser extends InferSelectModel<typeof users> {}
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental,
} = NextAuth({
  adapter: {
    ...DrizzleAdapter(db, table),
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
  },
  providers: [
    ...providers.map((p) => p.handler),
    ...(process.env.USE_OFFLINE
      ? [
          Email({
            from: "foo@bar.com",
            generateVerificationToken() {
              return crypto.randomUUID().replace("-", "").slice(0, 6);
            },
            async sendVerificationRequest(opts) {
              await new Promise((r) => setTimeout(r, 1000));
              console.log(`[EMAIL LOGIN]: ${opts.identifier} - ${opts.token}`);
            },
          }) as Provider,
        ]
      : []),
  ],
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
          defaultCurrency: user.defaultCurrency,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
  },
});

export async function currentUser(opts?: { redirect?: boolean }) {
  const session = await auth();
  if (!session?.user) {
    if (opts?.redirect) redirect("/login");
    return null;
  }
  return session.user;
}
