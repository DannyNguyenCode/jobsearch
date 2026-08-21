import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { CopyButton } from "@/components/ui/CopyButton";
import { initialsFromName } from "@/lib/applicant-view";
import { listApplicationsForRecruiter, listLinkedApplicants, recentUpdatesFrom } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Recruiter dashboard" };

export default async function RecruiterDashboardPage() {
  const user = await requireRole("recruiter");
  const firstName = user.fullName?.split(" ")[0] ?? "there";
  const referenceCode = user.referenceCode ?? "";
  const applicants = await listLinkedApplicants(referenceCode);
  const applications = await listApplicationsForRecruiter(referenceCode);
  const interviews = applications.filter((item) => item.status === "interview").length;
  const followUps = applications.filter(
    (item) => item.status === "interview" || item.status === "assessment" || item.status === "offer",
  );
  const updates = recentUpdatesFrom(applications);

  return (
    <div className="space-y-6">
      <div className="bg-primary-fixed border border-primary-fixed rounded-xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-base-100 p-2 rounded-full text-primary">
            <Icon name="handshake" size={32} />
          </div>
          <div>
            <h2 className="font-semibold">Share your ID to connect</h2>
            <p className="text-sm text-info-content">
              Applicants can use this code to easily link to your coaching profile.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-base-100 px-4 py-2 rounded-lg border border-outline-variant">
          <span className="font-bold tracking-widest text-primary">{referenceCode || "—"}</span>
          <CopyButton label="Copy recruiter ID" value={referenceCode} />
        </div>
      </div>

      <div>
        <h1 className="text-4xl font-bold tracking-tight">Good morning, {firstName}.</h1>
        <p className="text-lg text-muted mt-1">
          Follow the applications your candidates logged.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <article className="card-surface p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-secondary/20 p-3 rounded-lg text-secondary">
                  <Icon name="person" size={32} />
                </div>
                <span className="badge badge-ghost">{applications.length} open</span>
              </div>
              <p className="text-muted">Active applicants</p>
              <p className="text-4xl font-bold">{applicants.length}</p>
            </article>
            <article className="card-surface p-6" id="interviews">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-primary-fixed p-3 rounded-lg text-primary">
                  <Icon name="calendar_month" size={32} />
                </div>
                {interviews > 0 ? (
                  <span className="badge badge-error badge-outline">{interviews} open</span>
                ) : (
                  <span className="badge badge-ghost">None yet</span>
                )}
              </div>
              <p className="text-muted">Upcoming interviews</p>
              <p className="text-4xl font-bold">{interviews}</p>
            </article>
          </div>

          <section className="card-surface overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-base-100">
              <h2 className="font-semibold flex items-center gap-2">
                <Icon className="text-secondary" name="forum" />
                Needs coaching follow-up
              </h2>
              <Link className="text-primary font-medium hover:underline" href="/recruiter/applicants">
                View all
              </Link>
            </div>
            <ul>
              {followUps.length === 0 ? (
                <li className="p-6 text-sm text-muted">
                  Linked applications that reach interview, assessment, or offer will show up here.
                </li>
              ) : (
                followUps.slice(0, 5).map((item) => {
                  const href = `/recruiter/applicants/${item.applicantId}/applications/${item.id}`;
                  return (
                    <li className="flex items-center justify-between p-4 hover:bg-primary-fixed/40 gap-3" key={item.id}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-base-300 font-bold flex items-center justify-center">
                          {initialsFromName(item.applicantName ?? item.organization)}
                        </div>
                        <div className="min-w-0">
                          <Link className="font-semibold text-primary truncate block" href={href}>
                            {item.applicantName ?? "Applicant"}
                          </Link>
                          <p className="text-sm text-muted truncate">
                            {item.position} · {item.organization}
                          </p>
                        </div>
                      </div>
                      <Link className="btn btn-primary btn-sm shrink-0" href={href}>
                        {item.nextAction ?? "View"}
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </section>
        </div>

        <div className="md:col-span-4 space-y-6">
          <section className="card-surface overflow-hidden">
            <div className="p-6 border-b border-outline-variant">
              <h2 className="font-semibold flex items-center gap-2">
                <Icon name="history" />
                Recent activity
              </h2>
            </div>
            <ol className="p-6 space-y-5">
              {updates.length === 0 ? (
                <li className="text-sm text-muted">Activity from linked applications will appear here.</li>
              ) : (
                updates.map((event) => (
                  <li key={event.id}>
                    <span className="badge badge-ghost mb-1">{event.title}</span>
                    <p>
                      {event.description} {event.organization ? `at ${event.organization}.` : ""}
                    </p>
                    <p className="text-sm text-outline">{event.timestamp}</p>
                  </li>
                ))
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}