import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware: gate /dashboard/* and /admin/* by role.
 *
 * Token + role are mirrored to cookies on login (see lib/auth/session.ts).
 * In a real backend swap, you'd validate the JWT here against a JWKS or
 * call an /auth/introspect — same cookie names, same redirects.
 */

const AUTH_COOKIE = "ft.token";
const ROLE_COOKIE = "ft.role";

const USER_PREFIXES = [
  "/dashboard",
  "/transactions",
  "/transfer",
  "/send",
  "/receive",
  "/investments",
  "/crypto",
  "/settings",
];
const ADMIN_PREFIX = "/admin";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const role = req.cookies.get(ROLE_COOKIE)?.value as "USER" | "ADMIN" | undefined;
  const isAuthed = !!token;

  const isUserRoute = USER_PREFIXES.some((p) => pathname.startsWith(p));
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX);

  // Bounce unauthenticated users away from protected routes
  if ((isUserRoute || isAdminRoute) && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = ""; // drop any stale query params before we set our own
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // NOTE: We intentionally do NOT redirect authed users away from auth pages.
  // The "real" auth source of truth is the localStorage token (used by apiFetch);
  // the cookie is just a hint for the edge. Those two can drift (schema rebuild,
  // localStorage cleared, etc.) and the old behavior trapped users with stale
  // cookies on /admin → /login → /admin loops. Auth pages clear stale state on
  // mount instead — see AuthStaleStateGuard.

  // Role enforcement
  if (isAdminRoute && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (isUserRoute && role === "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run on everything except:
     *  - _next internals & static assets
     *  - /api (MSW intercepts; no need to gate)
     *  - favicon
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.png$).*)",
  ],
};
