import type { ApplicationSource } from "./types";

export const APPLICATION_SOURCES = [
  "jobBoard",
  "companySite",
  "recruiter",
  "referral",
  "other",
] as const satisfies readonly ApplicationSource[];

export const APPLICATION_SOURCE_LABELS: Record<ApplicationSource, string> = {
  jobBoard: "Job board",
  companySite: "Company website",
  recruiter: "Recruiter",
  referral: "Referral",
  other: "Other",
};
