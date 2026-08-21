import { UnlinkApplicantButton } from "@/components/applicants/UnlinkApplicantButton";
import { ApplicantApplicationStats } from "./ApplicantApplicationStats";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import type { ManagedApplicantSummary } from "@/lib/managed-applicants";

type ApplicantSummaryProps = {
  applicant: ManagedApplicantSummary;
};

function preferenceLabel(value: boolean) {
  return value ? "Yes" : "No";
}

export function ApplicantSummary({ applicant }: ApplicantSummaryProps) {
  return (
    <section className="card-surface p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <Avatar className="hidden sm:flex" name={applicant.name} initials={applicant.initials} size="lg" />
          <div className="min-w-0 space-y-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{applicant.name}</h1>
              {applicant.jobField ? <p className="text-muted mt-1">{applicant.jobField}</p> : null}
            </div>
            <ApplicantApplicationStats
              activeCount={applicant.activeCount}
              interviewCount={applicant.interviewCount}
              offerCount={applicant.offerCount}
            />
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="text-outline" name="mail" size={16} />
                <div className="min-w-0">
                  <dt className="text-xs font-semibold text-muted">Email</dt>
                  <dd className="break-all">{applicant.email}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="text-outline" name="phone" size={16} />
                <div>
                  <dt className="text-xs font-semibold text-muted">Phone number</dt>
                  <dd>{applicant.phone || "Not provided"}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="text-outline" name="location_on" size={16} />
                <div>
                  <dt className="text-xs font-semibold text-muted">Location</dt>
                  <dd>{applicant.location || "Not provided"}</dd>
                </div>
              </div>
            </dl>
            <div className="border-t border-outline-variant pt-3">
              <h2 className="text-sm font-semibold mb-2">Job preferences</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs font-semibold text-muted">Open to relocation</dt>
                  <dd>{preferenceLabel(applicant.openToRelocation)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">Remote work</dt>
                  <dd>{preferenceLabel(applicant.remotePreferred)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <UnlinkApplicantButton applicantId={applicant.id} applicantName={applicant.name} />
      </div>
    </section>
  );
}
