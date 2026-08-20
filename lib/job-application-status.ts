export const JOB_APPLICATION_STATUSES = [
  "PLANNING_TO_APPLY",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "ASSESSMENT",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;

export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number];

export const DEFAULT_JOB_APPLICATION_STATUS: JobApplicationStatus = "APPLIED";

export const JOB_APPLICATION_STATUS_LABELS: Record<JobApplicationStatus, string> = {
  PLANNING_TO_APPLY: "Planning",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  ASSESSMENT: "Assessment",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export function isJobApplicationStatus(value: unknown): value is JobApplicationStatus {
  return typeof value === "string" && (JOB_APPLICATION_STATUSES as readonly string[]).includes(value);
}
