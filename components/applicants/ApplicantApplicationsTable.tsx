"use client";

import { useMemo, useState } from "react";
import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { ApplicationTable } from "@/components/applications/ApplicationTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { ACTIVE_STATUS_FILTERS, filterAndSortApplications } from "@/lib/managed-applicants";
import { STATUS_LABELS } from "@/lib/status";
import type { ApplicationStatus, JobApplication } from "@/lib/types";

type ApplicantApplicationsTableProps = {
  applicantId: string;
  applications: JobApplication[];
};

export function ApplicantApplicationsTable({
  applicantId,
  applications,
}: ApplicantApplicationsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const rows = useMemo(
    () => filterAndSortApplications(applications, { query, status, sort }),
    [applications, query, sort, status],
  );

  const viewHref = (application: JobApplication) =>
    `/recruiter/applicants/${applicantId}/applications/${application.id}`;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Applications</h2>
          <p className="text-sm text-muted">Jobs this applicant has logged.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="input flex items-center gap-2 sm:w-56">
            <Icon className="text-outline" name="search" size={18} />
            <span className="sr-only">Search applications</span>
            <input
              aria-label="Search applications"
              className="grow"
              placeholder="Search applications"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="form-control">
            <span className="sr-only">Filter by status</span>
            <select
              aria-label="Filter by status"
              className="select select-bordered"
              value={status}
              onChange={(event) => setStatus(event.target.value as ApplicationStatus | "all")}
            >
              <option value="all">All statuses</option>
              {ACTIVE_STATUS_FILTERS.map((option) => (
                <option key={option} value={option}>
                  {STATUS_LABELS[option]}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control">
            <span className="sr-only">Sort by date</span>
            <select
              aria-label="Sort by date"
              className="select select-bordered"
              value={sort}
              onChange={(event) => setSort(event.target.value as "newest" | "oldest")}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </label>
        </div>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          description="This applicant has not added any job applications."
          icon="work"
          title="No applications yet"
        />
      ) : rows.length === 0 ? (
        <EmptyState
          description="Try a different search, status, or sort order."
          icon="search"
          title="No matching applications"
        />
      ) : (
        <>
          <div className="card-surface hidden md:block">
            <ApplicationTable
              applications={rows}
              dateHeader="Date Applied"
              getDate={(application) => application.dateApplied}
              viewHref={viewHref}
            />
          </div>
          <div className="md:hidden space-y-3">
            {rows.map((application) => (
              <ApplicationCard application={application} href={viewHref(application)} key={application.id} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
