"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActivityTimeline } from "./ActivityTimeline";
import { DocumentPanel } from "./DocumentPanel";
import { CommentsPanel } from "./CommentsPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { APPLICATION_SOURCE_LABELS } from "@/lib/application-source";
import { STATUS_LABELS } from "@/lib/status";
import type { Applicant, JobApplication } from "@/lib/types";
import { ApplicationLifecycleActions } from "./ApplicationLifecycleActions";

type FullScreenApplicationModalProps = {
  application: JobApplication;
  applicant: Applicant;
  mode: "applicant" | "recruiter";
  closeHref: string;
};

export function FullScreenApplicationModal({
  application,
  applicant,
  mode,
  closeHref,
}: FullScreenApplicationModalProps) {
  const router = useRouter();

  return (
    <div className="min-h-dvh bg-canvas flex flex-col">
      <header className="h-16 shrink-0 bg-base-100 border-b border-outline-variant flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <button
            aria-label="Close application details"
            className="btn btn-ghost btn-circle"
            type="button"
            onClick={() => router.push(closeHref)}
          >
            <Icon name="close" />
          </button>
          <div className="min-w-0">
            <h1 className="font-semibold truncate">{application.position}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={application.status} />
          {mode === "recruiter" ? (
            <span className="badge badge-ghost">View only</span>
          ) : (
            <>
              <ApplicationLifecycleActions
                applicationId={application.id}
                layout="row"
                status={application.status}
              />
              <Link className="btn btn-primary btn-sm md:btn-md" href={`/applicant/applications/${application.id}/edit`}>
                Edit
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
        <aside className="lg:w-80 shrink-0 bg-base-100 border-b lg:border-b-0 lg:border-r border-outline-variant p-6 space-y-6 overflow-y-auto">
          <div className="flex flex-col items-center text-center">
            <Avatar initials={applicant.initials} name={applicant.name} size="xl" />
            <h2 className="mt-4 text-xl font-semibold">{applicant.name}</h2>
            <p className="text-sm text-muted flex items-center gap-1">
              <Icon name="location_on" size={16} />
              {application.location || applicant.location}
            </p>
            <div className="flex gap-2 mt-4">
              <span
                className={mode === "recruiter" ? "tooltip tooltip-bottom" : undefined}
                data-tip={mode === "recruiter" ? "Email Applicant" : undefined}
              >
                <a
                  aria-label={mode === "recruiter" ? "Email Applicant" : "Email"}
                  className="btn btn-outline btn-sm btn-square"
                  href={`mailto:${applicant.email}`}
                >
                  <Icon name="mail" size={18} />
                </a>
              </span>
              {application.postingUrl ? (
                <span
                  className={mode === "recruiter" ? "tooltip tooltip-bottom" : undefined}
                  data-tip={mode === "recruiter" ? "Open Job Posting" : undefined}
                >
                  <a
                    aria-label={mode === "recruiter" ? "Open Job Posting" : "Job posting"}
                    className="btn btn-outline btn-sm btn-square"
                    href={application.postingUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon name="link" size={18} />
                  </a>
                </span>
              ) : null}
            </div>
          </div>
          <div className="divider my-0" />
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{STATUS_LABELS[application.status]}</dt>
              <dd>{application.statusDate ?? application.dateApplied}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Found on</dt>
              <dd className="text-right">{APPLICATION_SOURCE_LABELS[application.source]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Organization</dt>
              <dd className="text-right">{application.organization}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Contact</dt>
              <dd className="text-right">{application.contactName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Phone</dt>
              <dd>{application.phone || "—"}</dd>
            </div>
          </dl>
          <div className="divider my-0" />
          <DocumentPanel compact documents={application.documents} />
        </aside>

        <section className="flex-1 overflow-y-auto p-4 md:p-8 bg-base-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold">Application journey</h2>
            <p className="text-muted mb-8">Tracking progress for {application.position}.</p>
            <ActivityTimeline bare events={application.timeline} title="" variant="cards" />
            {application.notes ? (
              <div className="card-surface p-6 mt-6">
                <h3 className="font-semibold mb-2">{mode === "recruiter" ? "Applicant notes" : "Your notes"}</h3>
                <p className="text-sm text-muted">{application.notes}</p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="lg:w-80 shrink-0 bg-base-100 border-t lg:border-t-0 lg:border-l border-outline-variant overflow-y-auto">
          <CommentsPanel applicationId={application.id} comments={application.comments} />
        </aside>
      </div>
    </div>
  );
}