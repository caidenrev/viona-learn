import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session-token";

const STUDENT_PREFIXES = [
  "/workspace",
  "/roadmaps",
  "/learn",
  "/notes",
  "/playground",
  "/stats",
  "/calendar",
];

function isPrefixMatch(pathname: string, prefixes: string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === "/login") {
    if (session) {
      const dest = session.role === "TEACHER" ? "/admin" : "/workspace";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  if (isPrefixMatch(pathname, ["/admin"])) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.role !== "TEACHER") {
      return NextResponse.redirect(new URL("/workspace", req.url));
    }
    return NextResponse.next();
  }

  if (isPrefixMatch(pathname, STUDENT_PREFIXES)) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (session.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (isPrefixMatch(pathname, ["/settings"])) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/workspace/:path*",
    "/roadmaps/:path*",
    "/learn/:path*",
    "/notes/:path*",
    "/playground/:path*",
    "/stats/:path*",
    "/calendar/:path*",
    "/settings/:path*",
  ],
};
