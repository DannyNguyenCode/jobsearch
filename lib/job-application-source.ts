export const JOB_APPLICATION_SOURCES = [
  "LINKEDIN",
  "INDEED",
  "COMPANY_WEBSITE",
  "RECRUITER",
  "REFERRAL",
  "JOB_BANK",
  "OTHER",
] as const;

export type JobApplicationSource = (typeof JOB_APPLICATION_SOURCES)[number];

export const JOB_APPLICATION_SOURCE_LABELS: Record<JobApplicationSource, string> = {
  LINKEDIN: "LinkedIn",
  INDEED: "Indeed",
  COMPANY_WEBSITE: "Company website",
  RECRUITER: "Recruiter",
  REFERRAL: "Referral",
  JOB_BANK: "Job Bank",
  OTHER: "Other",
};

export function isJobApplicationSource(value: unknown): value is JobApplicationSource {
  return typeof value === "string" && (JOB_APPLICATION_SOURCES as readonly string[]).includes(value);
}
