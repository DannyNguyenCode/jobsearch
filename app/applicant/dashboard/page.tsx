import Link from "next/link";
import type { Metadata } from "next";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listApplicationsForApplicant, recentUpdatesFrom } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Applicant dashboard" };

export default async function ApplicantDashboardPage() {
  const user = await requireRole("applicant");
  const firstName = user.fullName?.split(" ")[0] ?? "there";
  const applications = await listApplicationsForApplicant(user.id);
  const interviews = applications.filter((item) => item.status === "interview").length;
  const pending = applications.filter((item) => item.status === "offer" || item.status === "assessment").length;
  const updates = recentUpdatesFrom(applications);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back, {firstName}</h1>
          <p className="text-muted mt-1">Log jobs you applied to, then keep their status here.</p>
        </div>
        <Link className="btn btn-primary" href="/applicant/applications/new">
          <Icon name="add" size={18} />
          Add application
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <article className="card-surface p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Interviews</h2>
              <span className="text-interview bg-interview/10 p-2 rounded-full">
                <Icon name="video_camera_front" />
              </span>
            </div>
            <p className="text-4xl font-bold text-primary">{interviews}</p>
            <p className="text-sm text-muted mt-1">Currently scheduled</p>
          </div>
          <Link className="btn btn-outline btn-primary mt-4" href="#priority">
            View schedule
          </Link>
        </article>
        <article className="card-surface p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Pending actions</h2>
              <span className="bg-error/10 text-error p-2 rounded-full">
                <Icon name="priority_high" />
              </span>
            </div>
            <p className="text-4xl font-bold text-error">{pending}</p>
            <p className="text-sm text-muted mt-1">Offers and assessments awaiting review</p>
          </div>
          <Link className="btn btn-primary mt-4" href="#priority">
            Review now
          </Link>
        </article>
        <article className="card-surface p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Active applications</h2>
              <span className="text-applied bg-applied/10 p-2 rounded-full">
                <Icon name="description" />
              </span>
            </div>
            <p className="text-4xl font-bold">{applications.length}</p>
            <p className="text-sm text-muted mt-1">Currently in progress</p>
          </div>
          <Link className="btn btn-outline mt-4" href="#priority">
            View applications
          </Link>
        </article>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="priority">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xl font-semibold">Priority applications</h2>
          {applications.length === 0 ? (
            <EmptyState
              action={
                <Link className="btn btn-primary" href="/applicant/applications/new">
                  Log an application
                </Link>
              }
              description="Start by logging a job you already applied to. Status, notes, and recruiter follow-up will live here."
              icon="work"
              title="No applications yet"
            />
          ) : (
            <>
              <div className="hidden md:flex flex-col gap-3">
                {applications.slice(0, 3).map((application) => (
                  <article
                    className="card-surface p-4 flex items-center justify-between gap-4"
                    key={application.id}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-base-200 text-primary font-semibold flex items-center justify-center">
                        {application.organization.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{application.position}</h3>
                        <p className="text-sm text-muted truncate">
                          {application.organization} • Applied {application.dateApplied}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={application.status} />
                      <Link className="btn btn-primary btn-sm" href={`/applicant/applications/${application.id}`}>
                        {application.nextAction?.split(" ")[0] ?? "View"}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              <div className="md:hidden space-y-3">
                {applications.map((application) => (
                  <ApplicationCard
                    application={application}
                    href={`/applicant/applications/${application.id}`}
                    key={application.id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Recent updates</h2>
          <div className="card-surface p-4">
            {updates.length === 0 ? (
              <p className="text-sm text-muted">Updates will appear here after you log an application.</p>
            ) : (
              <ol className="space-y-4 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-outline-variant">
                {updates.map((event) => (
                  <li className="flex gap-3 relative" key={event.id}>
                    <span className="w-6 h-6 rounded-full bg-base-100 border-2 border-outline-variant shrink-0 z-10" />
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted">
                        {event.organization} · {event.timestamp}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <Link className="block text-center text-primary font-medium mt-3 hover:underline" href="/applicant/archived">
            View all history
          </Link>
        </div>
      </div>
    </div>
  );
}
