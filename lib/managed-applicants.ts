import type { ApplicationStatus, JobApplication } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/status";

export type ManagedApplicantSummary = {
  id: string;
  name: string;
  email: string;
  initials: string;
  jobField: string;
  phone: string;
  location: string;
  openToRelocation: boolean;
  remotePreferred: boolean;
  activeCount: number;
  interviewCount: number;
  offerCount: number;
  lastActivityAt: string | null;
};

export const ACTIVE_STATUS_FILTERS = STATUS_OPTIONS;

export function selectDefaultManagedApplicantId(applicants: ManagedApplicantSummary[]) {
  if (applicants.length === 0) return null;

  let selected = applicants[0];
  let latest = Number.NEGATIVE_INFINITY;

  for (const applicant of applicants) {
    if (!applicant.lastActivityAt) continue;
    const timestamp = Date.parse(applicant.lastActivityAt);
    if (Number.isNaN(timestamp) || timestamp <= latest) continue;
    selected = applicant;
    latest = timestamp;
  }

  return selected.id;
}

export function filterManagedApplicants(applicants: ManagedApplicantSummary[], query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return applicants;
  return applicants.filter(
    (applicant) =>
      applicant.name.toLowerCase().includes(term) ||
      applicant.email.toLowerCase().includes(term) ||
      applicant.jobField.toLowerCase().includes(term),
  );
}

export function mergeSelectedApplicantSummary(
  applicant: {
    id: string;
    name: string;
    email: string;
    initials: string;
    title: string;
    phone?: string;
    location?: string;
    openToRelocation?: boolean;
    remotePreferred?: boolean;
  },
  summaries: ManagedApplicantSummary[],
  applications: JobApplication[],
): ManagedApplicantSummary {
  const existing = summaries.find((item) => item.id === applicant.id);
  if (existing) {
    return {
      ...existing,
      name: applicant.name,
      email: applicant.email,
      initials: applicant.initials,
      phone: applicant.phone ?? existing.phone,
      location: applicant.location ?? existing.location,
      openToRelocation: applicant.openToRelocation ?? existing.openToRelocation,
      remotePreferred: applicant.remotePreferred ?? existing.remotePreferred,
    };
  }

  return {
    id: applicant.id,
    name: applicant.name,
    email: applicant.email,
    initials: applicant.initials,
    jobField: applicant.title === "Applicant" ? "" : applicant.title,
    phone: applicant.phone ?? "",
    location: applicant.location ?? "",
    openToRelocation: Boolean(applicant.openToRelocation),
    remotePreferred: Boolean(applicant.remotePreferred),
    activeCount: applications.length,
    interviewCount: applications.filter((item) => item.status === "interview").length,
    offerCount: applications.filter((item) => item.status === "offer").length,
    lastActivityAt: null,
  };
}

export function filterAndSortApplications(
  applications: JobApplication[],
  options: { query: string; status: ApplicationStatus | "all"; sort: "newest" | "oldest" },
) {
  const term = options.query.trim().toLowerCase();
  let rows = applications;

  if (term) {
    rows = rows.filter(
      (application) =>
        application.organization.toLowerCase().includes(term) ||
        application.position.toLowerCase().includes(term) ||
        application.location.toLowerCase().includes(term),
    );
  }

  if (options.status !== "all") {
    rows = rows.filter((application) => application.status === options.status);
  }

  return [...rows].sort((left, right) => {
    const comparison = left.dateApplied.localeCompare(right.dateApplied);
    return options.sort === "newest" ? -comparison : comparison;
  });
}
