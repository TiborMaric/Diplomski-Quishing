import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "qsh_session";
const SIXTY_DAYS_SECONDS = 60 * 60 * 24 * 60;

/**
 * Issues a per-device session cookie on first request and lets every
 * subsequent request through unchanged. The cookie is the join key for
 * `scan_events` → `form_submissions` → `debrief_interactions`.
 */
export function middleware(request: NextRequest) {
  const existing = request.cookies.get(COOKIE_NAME);
  if (existing?.value) {
    return NextResponse.next();
  }

  const token = crypto.randomUUID();

  // Make the new value visible to downstream Server Components on THIS request.
  request.cookies.set(COOKIE_NAME, token);

  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Set-Cookie so the browser persists it for subsequent requests.
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SIXTY_DAYS_SECONDS,
  });

  return response;
}

export const config = {
  /*
   * Match every path EXCEPT:
   *   - /_next/static  (static assets)
   *   - /_next/image   (image optimisation)
   *   - /favicon.ico
   *   - any URL containing a literal dot (a static file extension)
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
