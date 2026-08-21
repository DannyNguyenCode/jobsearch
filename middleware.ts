import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
import type { UserRole } from "@/lib/types";

// Keep this as middleware.ts. Next.js 16.3 + Turbopack on Windows 404s app and
// Auth.js routes when the same gate lives in proxy.ts.

function dashboardForRole(role: UserRole) {
  return role === "recruiter" ? "/recruiter/dashboard" : "/applicant/dashboard";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await auth();
  const role = session?.user?.role;
  const isApplicantPath = pathname.startsWith("/applicant");
  const isRecruiterPath = pathname.startsWith("/recruiter");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/verify-email" ||
    pathname === "/forgot-password";

  if (isApplicantPath) {
    if (role === "applicant") return NextResponse.next();
    if (role === "recruiter") {
      return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  if (isRecruiterPath) {
    if (role === "recruiter") return NextResponse.next();
    if (role === "applicant") {
      return NextResponse.redirect(new URL("/applicant/dashboard", request.url));
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && role) {
    return NextResponse.redirect(new URL(dashboardForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/applicant/:path*",
    "/recruiter/:path*",
    "/login",
    "/register",
    "/verify-email",
    "/forgot-password",
  ],
};
