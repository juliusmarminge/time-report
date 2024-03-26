import "server-only";

import NextAuth from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authConfig } from "./config";

export const currentUser = cache(
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

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth(authConfig);
