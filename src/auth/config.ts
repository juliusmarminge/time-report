import type { InferSelectModel } from "drizzle-orm";
import type { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import type { users } from "~/db/schema";
import { drizzleAdapter, mockEmail } from "./adapters";

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

export const authConfig = {
  adapter: drizzleAdapter,
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
      if (!("session" in opts)) throw "unreachable for session strategy";
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
} satisfies NextAuthConfig;
