import Github from "@auth/core/providers/github";
import type { DefaultSession } from "@auth/core/types";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";

import { db } from "~/db";
import { table } from "~/db/schema";

export type { Session } from "@auth/core/types";

export const providers = [{ name: "github", handler: Github }] as const;
export type OAuthProviders = (typeof providers)[number]["name"];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental,
} = NextAuth({
  adapter: DrizzleAdapter(db, table),
  providers: providers.map((p) => p.handler),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
});

export async function currentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}
