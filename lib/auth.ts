import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import NextAuth from "next-auth";
import "next-auth/adapters";
import type { EmailConfig } from "next-auth/providers";
import Github from "next-auth/providers/github";
import { redirect } from "next/navigation";
import * as React from "react";

import { db } from "~/db/client";
import { sessions, users } from "~/db/schema";

export type { Session } from "next-auth";

export const providers = [{ name: "github", handler: Github }] as const;
export type OAuthProviders = (typeof providers)[number]["name"];

declare module "next-auth" {
  interface Session {
    user: InferSelectModel<typeof users>;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends InferSelectModel<typeof users> {}
}

const mockEmail = {
  id: "email",
  name: "Email",
  type: "email",
  from: "mock@test.com",
  maxAge: 86400,
  server: "mock",
  generateVerificationToken: () => "supersecret",
  async sendVerificationRequest(opts) {
    await new Promise((r) => setTimeout(r, 1000));
    console.log(`[EMAIL LOGIN]: ${opts.identifier} - ${opts.token}`);
  },
  options: {},
} satisfies EmailConfig;

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: {
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
  },
  providers: [
    ...providers.map((p) => p.handler),
    ...(process.env.VERCEL_ENV !== "production" ? [mockEmail] : []),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const url = request.nextUrl;

      if (!auth?.user) {
        url.pathname = "/login";
        return Response.redirect(url);
      }

      if (url.pathname === "/report") {
        url.pathname = `/report/${Intl.DateTimeFormat("en-US", {
          month: "short",
          year: "2-digit",
        })
          .format(Date.now())
          .replace(" ", "")}`;
        return Response.redirect(url);
      }
    },
    session: (opts) => {
      if (!("user" in opts)) throw "unreachable for session strategy";
      const { session, user } = opts;

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

export const currentUser = React.cache?.(
  // optional chaining is here cause cache is not defined in middleware
  async (opts?: { redirect?: boolean }) => {
    const session = await auth();
    if (!session?.user) {
      if (opts?.redirect) redirect("/login");
      return null;
    }
    return session.user;
  },
);