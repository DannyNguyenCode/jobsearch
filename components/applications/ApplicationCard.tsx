import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Icon } from "@/components/ui/Icon";
import { APPLICATION_SOURCE_LABELS } from "@/lib/application-source";
import type { JobApplication } from "@/lib/types";
import { ApplicationLifecycleActions } from "./ApplicationLifecycleActions";

type ApplicationCardProps = {
  application: JobApplication;
  href: string;
  actionLabel?: string;
  showApplicant?: boolean;
  manageActions?: boolean;
};

export function ApplicationCard({
  application,
  href,
  actionLabel,
  showApplicant = false,
  manageActions = false,
}: ApplicationCardProps) {
  const applicantName = application.applicantName;
  const orgInitials = application.organization
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article className="card-surface p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-base-200 text-primary font-semibold flex items-center justify-center shrink-0">
            {orgInitials}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{application.position}</h3>
            <p className="text-sm text-muted truncate">
              {showApplicant && applicantName
                ? `${applicantName} • ${application.organization}`
                : `${application.organization} • ${APPLICATION_SOURCE_LABELS[application.source]}`}
            </p>
          </div>
        </div>
        <StatusBadge status={application.status} />
      </div>
      <div className="flex items-center gap-1 text-sm text-muted">
        <Icon name="location_on" size={16} />
        {application.location}
      </div>
      <div className="border-t border-outline-variant pt-3 flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-outline">Next action</p>
          <p className="text-sm">{application.nextAction ?? "View details"}</p>
        </div>
        <Link className="btn btn-primary btn-sm" href={href}>
          {actionLabel ?? "View"}
        </Link>
      </div>
      {manageActions ? (
        <ApplicationLifecycleActions applicationId={application.id} status={application.status} />
      ) : null}
    </article>
  );
}