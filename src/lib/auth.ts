import { redirect } from "next/navigation";
import type { EmailConfig } from "@auth/core/providers";
import Github from "@auth/core/providers/github";
import type { InferSelectModel } from "drizzle-orm";
import NextAuth from "next-auth";

import { mySqlDrizzleAdapter } from "~/db/auth-adapter";
import { db } from "~/db/client";
import { users } from "~/db/schema";

export type { Session } from "@auth/core/types";

export const providers = [{ name: "github", handler: Github }] as const;
export type OAuthProviders = (typeof providers)[number]["name"];

declare module "@auth/core/types" {
  interface Session {
    user: InferSelectModel<typeof users>;
  }
}

const mockEmail = {
  id: "email",
  name: "Email",
  type: "email",
  from: "mock@test.com",
  maxAge: 86400,
  server: "mock",
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
  adapter: mySqlDrizzleAdapter(db),
  providers: [
    ...providers.map((p) => p.handler),
    ...(process.env.NODE_ENV === "development" ? [mockEmail] : []),
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
