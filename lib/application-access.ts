import type { UserRole } from "@/lib/types";

export function canWriteApplications(role?: UserRole) {
  return role === "applicant";
}

export function canReadApplications(role?: UserRole) {
  return role === "applicant" || role === "recruiter";
}

export const WRITE_FORBIDDEN =
  "Recruiters can view linked applications but cannot add, update, archive, or delete them.";
