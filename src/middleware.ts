// import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Temporal } from "@js-temporal/polyfill";

import { auth } from "~/lib/auth";

const publicRoutes = ["/", "/login(.*)", "/api(.*)"];

const isPublic = (url: URL) =>
  publicRoutes.some((route) => new RegExp(`^${route}$`).test(url.pathname));

export default auth((req) => {
  const url = req.nextUrl;
  const auth = req.auth;

  if (url.pathname === "/login" && auth?.user) {
    // User is already signed in, redirect to app
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (isPublic(url)) {
    // Public path, go ahead
    return NextResponse.next();
  }

  if (!auth?.user) {
    // Protected path and user is not signed in, redirect to signin
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (url.pathname === "/report") {
    url.pathname = `/report/${Temporal.Now.plainDateISO()
      .toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      })
      .replace(" ", "")}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

// Dev
// export default function middleware(request: NextRequest) {
//   const url = request.nextUrl;
//   if (isPublic(url)) {
//     // Public path, go ahead
//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
