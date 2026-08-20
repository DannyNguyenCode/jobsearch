import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RecruiterApplicantsWorkspace } from "@/components/applicants/RecruiterApplicantsWorkspace";
import { loadRecruiterApplicantWorkspace } from "@/lib/application-service";
import { mergeSelectedApplicantSummary } from "@/lib/managed-applicants";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Managed applicant" };

export default async function RecruiterApplicantWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("recruiter");
  const { id } = await params;
  const loaded = await loadRecruiterApplicantWorkspace(id, user.referenceCode ?? "");
  if (!loaded) notFound();

  const selectedApplicant = mergeSelectedApplicantSummary(
    loaded.applicant,
    loaded.summaries,
    loaded.applications,
  );

  return (
    <RecruiterApplicantsWorkspace
      applicants={loaded.summaries}
      applications={loaded.applications}
      selectedApplicant={selectedApplicant}
    />
  );
}
