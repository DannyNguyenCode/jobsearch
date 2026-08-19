import type { Metadata } from "next";
import Link from "next/link";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { ApplicationTable } from "@/components/applications/ApplicationTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { listApplicationsForApplicant } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Archived applications" };

export default async function ArchivedApplicationsPage() {
  const user = await requireRole("applicant");
  const archived = await listApplicationsForApplicant(user.id, "archive");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Archived applications</h1>
        <p className="text-muted mt-1">
          Closed, rejected, or stored applications stay here. Restore one to your tracker, or delete it permanently.
        </p>
      </div>
      {archived.length === 0 ? (
        <EmptyState
          description="When you archive an application it will appear in this list."
          icon="inventory_2"
          title="No archived applications"
          action={
            <Link className="btn btn-primary" href="/applicant/dashboard">
              Back to dashboard
            </Link>
          }
        />
      ) : (
        <>
          <div className="card-surface hidden md:block">
            <ApplicationTable
              applications={archived}
              manageActions
              viewHref={(application) => `/applicant/applications/${application.id}`}
            />
          </div>
          <div className="md:hidden space-y-3">
            {archived.map((application) => (
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
    </div>
  );
}
