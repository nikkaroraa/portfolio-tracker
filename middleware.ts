import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Skip auth for API routes except the auth endpoint
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    !request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  // Check if authentication is required
  const authRequired = process.env.AUTH_REQUIRED === "true";

  // In development, allow AUTH_REQUIRED to work
  const shouldRequireAuth =
    authRequired && (process.env.NODE_ENV === "production" || authRequired);

  if (shouldRequireAuth) {
    // Basic Auth implementation
    const basicAuth = request.headers.get("authorization");
    const url = request.nextUrl;

    if (!basicAuth) {
      url.pathname = "/api/auth";
      return NextResponse.rewrite(url);
    }

    const authValue = basicAuth.split(" ")[1];
    if (!authValue) {
      url.pathname = "/api/auth";
      return NextResponse.rewrite(url);
    }

    try {
      const [user, pwd] = atob(authValue).split(":");

      if (
        user === process.env.BASIC_AUTH_USER &&
        pwd === process.env.BASIC_AUTH_PASSWORD
      ) {
        return NextResponse.next();
      }
    } catch {
      // Invalid base64 or format
    }

    url.pathname = "/api/auth";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
