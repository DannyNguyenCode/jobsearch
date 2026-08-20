import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { APPLICATION_SOURCE_LABELS } from "@/lib/application-source";
import type { JobApplication } from "@/lib/types";
import { ApplicationLifecycleActions } from "./ApplicationLifecycleActions";

type ApplicationTableProps = {
  applications: JobApplication[];
  viewHref: (application: JobApplication) => string;
  showApplicant?: boolean;
  manageActions?: boolean;
  dateHeader?: string;
  getDate?: (application: JobApplication) => string;
};

export function ApplicationTable({
  applications,
  viewHref,
  showApplicant = false,
  manageActions = false,
  dateHeader = "Date",
  getDate = (application) => application.statusDate ?? application.dateApplied,
}: ApplicationTableProps) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-muted text-xs uppercase tracking-wider">
            {showApplicant ? <th>Applicant</th> : null}
            <th>{dateHeader}</th>
            <th>Organization</th>
            <th>Position</th>
            <th>Source</th>
            <th>Location</th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => {
            return (
              <tr className="hover:bg-primary-fixed/40" key={application.id}>
                {showApplicant ? (
                  <td>
                    <div className="font-medium">{application.applicantName}</div>
                    <div className="text-xs text-muted">{application.applicantEmail}</div>
                  </td>
                ) : null}
                <td className="text-muted whitespace-nowrap">{getDate(application)}</td>
                <td>{application.organization}</td>
                <td className="text-primary font-medium">{application.position}</td>
                <td className="text-muted">{APPLICATION_SOURCE_LABELS[application.source]}</td>
                <td className="text-muted">{application.location}</td>
                <td>
                  <StatusBadge status={application.status} />
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      aria-label={`View ${application.position} at ${application.organization}`}
                      className="btn btn-ghost btn-sm"
                      href={viewHref(application)}
                    >
                      <Icon name="visibility" size={18} />
                      View
                    </Link>
                    {manageActions ? (
                      <ApplicationLifecycleActions
                        applicationId={application.id}
                        layout="row"
                        status={application.status}
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}