import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "cockpit_auth";

export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie && cookie === process.env.COCKPIT_AUTH_TOKEN) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
};
