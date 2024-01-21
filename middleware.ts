import { NextRequest, NextResponse } from "next/server";

import { auth } from "~/lib/auth";

const PUBLIC_ROUTES = ["/", "/login(.*)", "/api(.*)"];
const isPublic = (url: URL) =>
  PUBLIC_ROUTES.some((route) => new RegExp(`^${route}$`).test(url.pathname));

const authMiddleware = auth((req) => {
  const url = req.nextUrl;
  const auth = req.auth;

  if (!auth?.user) {
    // Protected path and user is not signed in, redirect to signin
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (url.pathname === "/report") {
    url.pathname = `/report/${Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "2-digit",
    })
      .format(Date.now())
      .replace(" ", "")}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export default (req: NextRequest) => {
  if (isPublic(req.nextUrl)) {
    return NextResponse.next();
  }
  return authMiddleware(req, {});
};

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
