import { NextResponse } from "next/server";

import { auth } from "~/lib/auth";

const publicRoutes = ["/", "/login(.*)", "/api(.*)"];

export default auth((req) => {
  const url = req.nextUrl;
  const auth = req.auth;

  if (url.pathname === "/login" && auth.user) {
    // User is already signed in, redirect to app
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (
    publicRoutes.some((route) => new RegExp(`^${route}$`).test(url.pathname))
  ) {
    // Public path, go ahead
    return NextResponse.next();
  }

  if (!auth.user) {
    // Protected path and user is not signed in, redirect to signin
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
