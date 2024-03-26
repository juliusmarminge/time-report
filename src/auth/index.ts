import NextAuth from "next-auth";
import { redirect } from "next/navigation";
import { cache } from "react";
import { authConfig } from "./config";

const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth: defaultAuth,
} = NextAuth(authConfig);
export { GET, POST, signIn, signOut };

export const auth = cache(defaultAuth);
export const currentUser = cache(async (opts?: { redirect?: boolean }) => {
  const session = await auth();
  if (!session?.user) {
    if (opts?.redirect) redirect("/login");
    return null;
  }
  return session.user;
});
