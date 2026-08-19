import { ApplicantShell } from "@/components/layout/ApplicantShell";
import { requireRole } from "@/lib/require-role";

export default async function ApplicantLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("applicant");
  return <ApplicantShell userName={user.fullName}>{children}</ApplicantShell>;
}
