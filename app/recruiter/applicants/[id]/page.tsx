import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ApplicantPipelineSidebar } from "@/components/layout/ApplicantPipelineSidebar";
import { ActivityTimeline } from "@/components/applications/ActivityTimeline";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UnlinkApplicantButton } from "@/components/applicants/UnlinkApplicantButton";
import { loadApplicantForRecruiter, listLinkedApplicants } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";
import { STATUS_LABELS } from "@/lib/status";

const STAGES = [
  { label: "Sourced", icon: "check" },
  { label: "Screening", icon: "check" },
  { label: "Interviewing", icon: "radio_button_checked" },
  { label: "Offer", icon: "handshake" },
  { label: "Hired", icon: "celebration" },
] as const;

export const metadata: Metadata = { title: "Applicant" };

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("recruiter");
  const { id } = await params;
  const loaded = await loadApplicantForRecruiter(id, user.referenceCode ?? "");
  if (!loaded) notFound();

  const { applicant, applications: history } = loaded;
  const pipeline = await listLinkedApplicants(user.referenceCode ?? "");
  const featured = history.find((item) => item.status !== "archived" && item.status !== "rejected") ?? history[0];
  const currentStageIndex =
    featured?.status === "offer"
      ? 3
      : featured?.status === "interview"
        ? 2
        : featured?.status === "screening"
          ? 1
          : 0;

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <ApplicantPipelineSidebar applicants={pipeline} />
      <div className="flex-1 min-w-0 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Candidates", href: "/recruiter/applicants" },
            { label: applicant.name },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-primary-fixed text-primary font-bold text-2xl flex items-center justify-center">
              {applicant.initials}
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{applicant.name}</h1>
              <p className="text-muted flex flex-wrap gap-2 mt-1">
                <span className="flex items-center gap-1">
                  <Icon name="work" size={18} /> {applicant.title}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Icon name="location_on" size={18} /> {applicant.location}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a className="btn btn-outline btn-primary" href={`mailto:${applicant.email}`}>
              <Icon name="mail" size={18} /> Message
            </a>
            <UnlinkApplicantButton applicantId={applicant.id} applicantName={applicant.name} />
          </div>
        </div>

        <section className="card-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold">Application journey</h2>
            <span className="badge badge-secondary">On track</span>
          </div>
          <div className="relative flex justify-between items-start px-1">
            <div className="absolute left-0 right-0 top-4 h-1 bg-base-300 rounded-full" />
            <div
              className="absolute left-0 top-4 h-1 bg-primary rounded-full"
              style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
            />
            {STAGES.map((stage, index) => {
              const complete = index < currentStageIndex;
              const current = index === currentStageIndex;
              return (
                <div className="relative z-10 flex flex-col items-center gap-2 flex-1" key={stage.label}>
                  <div
                    className={`rounded-full flex items-center justify-center ${
                      current
                        ? "w-10 h-10 bg-base-100 border-4 border-primary text-primary -translate-y-1"
                        : complete
                          ? "w-8 h-8 bg-primary text-primary-content"
                          : "w-8 h-8 bg-base-100 border-2 border-outline-variant text-outline"
                    }`}
                  >
                    {complete ? (
                      <Icon name="check" size={16} />
                    ) : current ? (
                      <span className="w-3 h-3 rounded-full bg-primary" />
                    ) : (
                      <Icon name={stage.icon} size={16} />
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${current ? "text-primary" : "text-muted"}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <article className="card-surface p-4">
                <p className="text-sm text-muted mb-1 flex items-center gap-1">
                  <Icon className="text-secondary" name="description" size={18} /> Applications
                </p>
                <p className="text-2xl font-semibold">{history.length}</p>
                <p className="text-sm text-muted">Jobs this candidate logged</p>
              </article>
              <article className="card-surface p-4">
                <p className="text-sm text-muted mb-1 flex items-center gap-1">
                  <Icon className="text-secondary" name="video_camera_front" size={18} /> Interviews
                </p>
                <p className="text-2xl font-semibold">
                  {history.filter((item) => item.status === "interview").length}
                </p>
                <p className="text-sm text-muted">Currently in interview</p>
              </article>
              <article className="card-surface p-4">
                <p className="text-sm text-muted mb-1 flex items-center gap-1">
                  <Icon className="text-secondary" name="flag" size={18} /> Latest status
                </p>
                <p className="text-2xl font-semibold">
                  {featured ? STATUS_LABELS[featured.status] : "—"}
                </p>
                <p className="text-sm text-muted">{featured?.organization ?? "No applications yet"}</p>
              </article>
            </div>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Active applications
                <span className="badge badge-primary">{history.length}</span>
              </h2>
              <div className="space-y-3 mt-3">
                {history.length === 0 ? (
                  <EmptyState
                    description="This applicant has not logged any applications yet."
                    icon="work"
                    title="No applications"
                  />
                ) : (
                  history.map((application) => (
                  <article className="card-surface p-6" key={application.id}>
                    <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-base-300 pb-4 mb-4">
                      <div>
                        <h3 className="font-semibold">{application.position}</h3>
                        <p className="text-sm text-muted">
                          {application.organization} • Applied {application.dateApplied}
                        </p>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    {application.nextAction ? (
                      <p className="text-sm mb-3">
                        Current stage: <span className="font-medium text-primary">{application.nextAction}</span>
                      </p>
                    ) : null}
                    {application.comments[0] ? (
                      <blockquote className="bg-base-200 rounded-lg p-4 border-l-4 border-secondary text-sm italic">
                        “{application.comments[application.comments.length - 1]?.body}”
                        <footer className="not-italic text-xs text-muted mt-2">
                          Comment from {application.comments[application.comments.length - 1]?.author}
                        </footer>
                      </blockquote>
                    ) : null}
                    <div className="flex justify-end mt-4">
                      <Link
                        className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                        href={`/recruiter/applicants/${applicant.id}/applications/${application.id}`}
                      >
                        View full application
                        <Icon name="arrow_forward" size={16} />
                      </Link>
                    </div>
                  </article>
                ))
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="card-surface p-6 h-full flex flex-col">
              <ActivityTimeline
                bare
                events={featured?.timeline ?? []}
                title="Relationship timeline"
              />
              <p className="text-xs text-muted mt-4 pt-4 border-t border-outline-variant">
                View only. The applicant owns changes to this application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
