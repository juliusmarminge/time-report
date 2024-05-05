import {
  type MiddlewareConfig,
  type NextRequest,
  NextResponse,
} from "next/server";
import { auth } from "~/auth";

const PUBLIC_ROUTES = ["/", "/login(.*)"];
const isPublic = (url: URL) =>
  PUBLIC_ROUTES.some((route) => new RegExp(`^${route}$`).test(url.pathname));

export default (req: NextRequest) => {
  if (isPublic(new URL(req.nextUrl.href))) {
    return NextResponse.next();
  }
  // Run auth middleware for route protection, session management, etc.
  return auth(() => NextResponse.next())(req, {});
};

export const config: MiddlewareConfig = {
  matcher: [
    // Omit API routes and static files
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
