import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/types";

export async function requireRole(role: UserRole) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== role) {
    redirect(session.user.role === "recruiter" ? "/recruiter/dashboard" : "/applicant/dashboard");
  }
  return session.user;
}
