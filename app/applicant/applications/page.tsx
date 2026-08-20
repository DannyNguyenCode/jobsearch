import type { Metadata } from "next";
import Link from "next/link";
import { ApplicantApplicationViewTabs } from "@/components/applications/ApplicantApplicationViewTabs";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { ApplicationTable } from "@/components/applications/ApplicationTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import {
  applicantApplicationsCopy,
  applicationsForView,
  parseApplicantApplicationsView,
} from "@/lib/applicant-application-views";
import { listApplicationsForApplicant } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicantApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const user = await requireRole("applicant");
  const view = parseApplicantApplicationsView((await searchParams).view);
  const copy = applicantApplicationsCopy(view);
  const applications = applicationsForView(await listApplicationsForApplicant(user.id, "active"), view);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{copy.title}</h1>
          <p className="text-muted mt-1">{copy.description}</p>
        </div>
        <div className="flex flex-col sm:items-end gap-3">
          <div className="flex items-center gap-2">
            <Link className="btn btn-outline" href="/applicant/applications/print">
              <Icon name="print" size={18} />
              Print log
            </Link>
            <Link className="btn btn-primary" href="/applicant/applications/new">
              <Icon name="add" size={18} />
              Add application
            </Link>
          </div>
          <ApplicantApplicationViewTabs view={view} />
        </div>
      </div>
      {applications.length === 0 ? (
        <EmptyState
          action={
            view === "all" ? (
              <Link className="btn btn-primary" href="/applicant/applications/new">
                Log an application
              </Link>
            ) : (
              <Link className="btn btn-primary" href="/applicant/applications">
                View applications
              </Link>
            )
          }
          description={copy.emptyDescription}
          icon={view === "schedule" ? "video_camera_front" : view === "pending" ? "priority_high" : "work"}
          title={copy.emptyTitle}
        />
      ) : (
        <>
          <div className="card-surface hidden md:block">
            <ApplicationTable
              applications={applications}
              dateHeader={copy.dateHeader}
              getDate={(application) => application.statusDate ?? application.dateApplied}
              manageActions
              viewHref={(application) => `/applicant/applications/${application.id}`}
            />
          </div>
          <div className="md:hidden space-y-3">
            {applications.map((application) => (
              <ApplicationCard
                application={application}
                href={`/applicant/applications/${application.id}`}
                key={application.id}
                manageActions
              />
            ))}
          </div>
        </>
      )}
      <p className="text-center">
        <Link className="text-primary font-medium hover:underline" href="/applicant/archived">
          View archived applications
        </Link>
      </p>
    </div>
  );
}
