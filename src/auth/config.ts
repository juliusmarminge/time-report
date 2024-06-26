import type { NextAuthConfig } from "next-auth";
import Github from "next-auth/providers/github";
import Passkey from "next-auth/providers/passkey";
import type { User } from "~/edgedb";
import { edgedbAdapter, mockEmail } from "./adapters";

export const providers = [
  { name: "github", handler: Github },
  { name: "passkey", handler: Passkey },
] as const;
export type OAuthProviders = (typeof providers)[number]["name"];

type UserWithoutRelations = Omit<
  User,
  "accounts" | "authenticators" | "periods" | "sessions" | "timeslots"
>;

declare module "next-auth" {
  interface Session {
    user: UserWithoutRelations;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser extends UserWithoutRelations {}
  interface AdapterAuthenticator {
    // Just for convenience not having to convert null to undefined...
    transports: string | null | undefined;
  }
}

export const authConfig = {
  experimental: { enableWebAuthn: true },
  logger: {
    // debug: console.debug,
    warn: (code) => {
      const url = `https://warnings.authjs.dev#${code}`;
      if (code === "experimental-webauthn") return;
      console.warn(`\x1b[33m[auth][warn][${code}]\x1b[0m`, `Read more: ${url}`);
    },
    error: console.error,
  },
  adapter: edgedbAdapter,
  providers: [
    ...providers.map((p) => p.handler),
    ...(process.env.VERCEL_ENV !== "production" ? [mockEmail] : []),
  ],
  callbacks: {
    signIn: ({ user, email }) => {
      if (email?.verificationRequest) return true;

      const whitelist = ["julius0216@outlook.com", "foo@bar.com"];
      return !!user.email && whitelist.includes(user.email);
    },
    session: (opts) => {
      if (!("session" in opts)) throw "unreachable for session strategy";
      const { session, user } = opts;

      return {
        ...session,
        user: {
          id: user.id,
          email: user.email,
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
