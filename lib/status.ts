import type { ApplicationStatus } from "./types";

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  planning: "Planning",
  applied: "Applied",
  screening: "Screening",
  assessment: "Assessment",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  archived: "Archived",
  withdrawn: "Withdrawn",
};

export const STATUS_OPTIONS: ApplicationStatus[] = [
  "planning",
  "applied",
  "screening",
  "assessment",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export const ARCHIVE_STATUSES: ApplicationStatus[] = ["archived", "rejected", "withdrawn"];

export function isArchivedStatus(status: ApplicationStatus) {
  return ARCHIVE_STATUSES.includes(status);
}

export function nextActionFor(status: ApplicationStatus) {
  switch (status) {
    case "planning":
      return "Finish logging details";
    case "applied":
      return "Follow up";
    case "screening":
      return "Prep for screen";
    case "assessment":
      return "Complete assessment";
    case "interview":
      return "Prepare for interview";
    case "offer":
      return "Review offer";
    case "rejected":
      return "Review feedback";
    case "archived":
      return "View archive";
    case "withdrawn":
      return "Closed";
  }
}

export function statusClass(status: ApplicationStatus) {
  switch (status) {
    case "interview":
      return "bg-interview/10 text-interview border-interview/20";
    case "assessment":
      return "bg-assessment/10 text-warning-content border-assessment/30";
    case "offer":
      return "bg-offer/10 text-secondary border-offer/20";
    case "screening":
      return "bg-screening/10 text-screening border-screening/20";
    case "applied":
      return "bg-applied/10 text-info-content border-applied/20";
    case "rejected":
    case "withdrawn":
      return "bg-error/10 text-error border-error/20";
    case "archived":
    case "planning":
    default:
      return "bg-base-200 text-muted border-outline-variant";
  }
}