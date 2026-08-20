import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NoManagedApplicantsEmptyState } from "@/components/applicants/NoManagedApplicantsEmptyState";
import { listManagedApplicantSummaries } from "@/lib/application-service";
import { selectDefaultManagedApplicantId } from "@/lib/managed-applicants";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Managed applicants" };

export default async function ManagedApplicantsPage() {
  const user = await requireRole("recruiter");
  const recruiterCode = user.referenceCode ?? "";
  const managed = await listManagedApplicantSummaries(recruiterCode);

  if (managed.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Managed applicants</h1>
          <p className="text-muted mt-1">Candidates whose applications you follow.</p>
        </div>
        <NoManagedApplicantsEmptyState recruiterCode={recruiterCode} />
      </div>
    );
  }

  const selectedId = selectDefaultManagedApplicantId(managed);
  if (!selectedId) return null;
  redirect(`/recruiter/applicants/${selectedId}`);
}
