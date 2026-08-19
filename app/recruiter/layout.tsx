import { RecruiterShell } from "@/components/layout/RecruiterShell";
import { requireRole } from "@/lib/require-role";

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("recruiter");
  return <RecruiterShell userName={user.fullName}>{children}</RecruiterShell>;
}
