import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { ApplicationTable } from "@/components/applications/ApplicationTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { listApplicationsForRecruiter, listLinkedApplicants } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Managed applicants" };

export default async function ManagedApplicantsPage() {
  const user = await requireRole("recruiter");
  const recruiterCode = user.referenceCode ?? "";
  const applications = await listApplicationsForRecruiter(recruiterCode);
  const managed = await listLinkedApplicants(recruiterCode);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Managed applicants</h1>
        <p className="text-muted mt-1">
          {managed.length} candidates whose applications you follow.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <article className="card-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Applicants</p>
          <p className="text-3xl font-bold">{managed.length}</p>
        </article>
        <article className="card-surface p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Active applications</p>
          <p className="text-3xl font-bold">{applications.length}</p>
        </article>
      </div>
      {applications.length === 0 ? (
        <EmptyState
          action={
            <Link className="btn btn-primary" href="/recruiter/dashboard">
              Share your recruiter code
            </Link>
          }
          description="When an applicant links your recruiter code and logs a job, it will show up here."
          icon="group"
          title="No linked applications yet"
        />
      ) : (
        <>
          <section className="card-surface hidden md:block">
            <ApplicationTable
              applications={applications}
              showApplicant
              viewHref={(application) =>
                `/recruiter/applicants/${application.applicantId}/applications/${application.id}`
              }
            />
          </section>
          <div className="md:hidden space-y-3">
            {applications.map((application) => (
              <ApplicationCard
                application={application}
                href={`/recruiter/applicants/${application.applicantId}/applications/${application.id}`}
                key={application.id}
                showApplicant
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
