import { UnlinkApplicantButton } from "@/components/applicants/UnlinkApplicantButton";
import { ApplicantApplicationStats } from "./ApplicantApplicationStats";
import { Avatar } from "@/components/ui/Avatar";
import type { ManagedApplicantSummary } from "@/lib/managed-applicants";

type ApplicantSummaryProps = {
  applicant: ManagedApplicantSummary;
};

export function ApplicantSummary({ applicant }: ApplicantSummaryProps) {
  return (
    <section className="card-surface p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Avatar className="hidden sm:flex" name={applicant.name} initials={applicant.initials} size="lg" />
          <div className="min-w-0 space-y-2">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{applicant.name}</h1>
              <p className="text-muted mt-1 break-all">{applicant.email}</p>
              {applicant.jobField ? <p className="text-muted">{applicant.jobField}</p> : null}
            </div>
            <ApplicantApplicationStats
              activeCount={applicant.activeCount}
              interviewCount={applicant.interviewCount}
              offerCount={applicant.offerCount}
            />
          </div>
        </div>
        <UnlinkApplicantButton applicantId={applicant.id} applicantName={applicant.name} />
      </div>
    </section>
  );
}
