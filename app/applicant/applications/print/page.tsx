import type { Metadata } from "next";
import Link from "next/link";
import { JobSearchLogTable } from "@/components/applications/JobSearchLogTable";
import { PrintJobSearchLogButton } from "@/components/applications/PrintJobSearchLogButton";
import { Icon } from "@/components/ui/Icon";
import { listApplicationsForApplicant } from "@/lib/application-service";
import { formatDisplayDate } from "@/lib/dates";
import { sortJobSearchLogApplications } from "@/lib/job-search-log";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Job search log" };

export default async function ApplicantJobSearchLogPrintPage() {
  const user = await requireRole("applicant");
  const [active, archived] = await Promise.all([
    listApplicationsForApplicant(user.id, "active"),
    listApplicationsForApplicant(user.id, "archive"),
  ]);
  const applications = sortJobSearchLogApplications([...active, ...archived]);

  return (
    <div className="min-h-dvh bg-white text-base-content">
      <div className="print:hidden border-b border-outline-variant bg-base-100 px-4 py-3 flex items-center justify-between gap-3">
        <Link className="btn btn-ghost" href="/applicant/applications">
          <Icon name="close" size={18} />
          Back
        </Link>
        <PrintJobSearchLogButton />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 print:max-w-none print:px-0 print:py-0">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Job Search Log</h1>
          <dl className="mt-4 text-sm max-w-md">
            <dt className="text-muted">Applicant Name</dt>
            <dd className="font-medium border-b border-base-content/40 pb-1">{user.fullName}</dd>
          </dl>
        </header>

        <JobSearchLogTable applications={applications} />

        <p className="mt-4 text-xs text-muted">
          Printed {formatDisplayDate(new Date())} · {applications.length} application
          {applications.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
