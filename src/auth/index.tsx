import NextAuth, { type Session } from "next-auth";
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
export const currentUser = cache(
  async <TRedirect extends boolean = false>(opts?: {
    redirect?: TRedirect;
  }): Promise<
    TRedirect extends true ? Session["user"] : Session["user"] | null
  > => {
    const session = await auth();
    if (!session?.user) {
      if (opts?.redirect) redirect("/login");
      return null as any;
    }
    return session.user;
  },
);

export async function SignedIn(props: {
  children:
    | React.ReactNode
    | ((props: { user: Session["user"] }) => React.ReactNode);
}) {
  const sesh = await auth();
  return sesh?.user ? (
    <>
      {typeof props.children === "function"
        ? props.children({ user: sesh.user })
        : props.children}
    </>
  ) : null;
}

export async function SignedOut(props: { children: React.ReactNode }) {
  const sesh = await auth();
  return sesh?.user ? null : <>{props.children}</>;
}
