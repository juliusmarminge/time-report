import { type NextRequest, NextResponse } from "next/server";

import { auth } from "~/lib/auth";

const PUBLIC_ROUTES = ["/", "/login(.*)", "/api(.*)"];
const isPublic = (url: URL) =>
  PUBLIC_ROUTES.some((route) => new RegExp(`^${route}$`).test(url.pathname));

export default (req: NextRequest) => {
  if (isPublic(req.nextUrl)) {
    return NextResponse.next();
  }
  // Run auth middleware for route protection, session management, etc.
  return auth(() => NextResponse.next())(req, {});
};

export const config = {
  matcher: [
    // Omit API routes and static files
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
