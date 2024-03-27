import NextAuth from "next-auth";
import { redirect } from "next/navigation";
import { authConfig } from "./config";

export const {
  handlers: { GET, POST },
  signIn,
  signOut,
  auth,
} = NextAuth(authConfig);

export const currentUser = async (opts?: { redirect?: boolean }) => {
  const session = await auth();
  if (!session?.user) {
    if (opts?.redirect) redirect("/login");
    return null;
  }
  return session.user;
};
