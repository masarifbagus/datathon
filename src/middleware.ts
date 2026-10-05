import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "lan-datathon-2026-secret-session-key-secure-jwt-lan-ri"
);

const COOKIE_NAME = "lan_auth_session";

async function verifyEdgeToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as {
      userId: string;
      username: string;
      name: string;
      role: "judge" | "admin";
    };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifyEdgeToken(token) : null;

  // Protect /judge routes
  if (pathname.startsWith("/judge")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "judge") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== "admin") {
      return NextResponse.redirect(new URL("/judge", request.url));
    }
  }

  // If already logged in and accessing /login
  if (pathname === "/login" && session) {
    if (session.role === "judge") {
      return NextResponse.redirect(new URL("/judge", request.url));
    } else if (session.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/judge/:path*", "/admin/:path*", "/login"],
};
