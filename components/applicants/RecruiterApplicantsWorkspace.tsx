import { ApplicantApplicationsTable } from "./ApplicantApplicationsTable";
import { ApplicantSummary } from "./ApplicantSummary";
import { ManagedApplicantsDrawer } from "./ManagedApplicantsDrawer";
import type { ManagedApplicantSummary } from "@/lib/managed-applicants";
import type { JobApplication } from "@/lib/types";

type RecruiterApplicantsWorkspaceProps = {
  applicants: ManagedApplicantSummary[];
  selectedApplicant: ManagedApplicantSummary;
  applications: JobApplication[];
};

export function RecruiterApplicantsWorkspace({
  applicants,
  selectedApplicant,
  applications,
}: RecruiterApplicantsWorkspaceProps) {
  return (
    <ManagedApplicantsDrawer
      applicants={applicants}
      selectedApplicant={selectedApplicant}
      key={selectedApplicant.id}
    >
      <div className="space-y-6">
        <ApplicantSummary applicant={selectedApplicant} />
        <ApplicantApplicationsTable applicantId={selectedApplicant.id} applications={applications} />
      </div>
    </ManagedApplicantsDrawer>
  );
}
