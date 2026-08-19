export { auth as proxy } from "@/auth";

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
