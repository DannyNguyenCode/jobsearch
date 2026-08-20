import { formatDisplayDate, parseDateInput } from "@/lib/dates";
import { STATUS_LABELS } from "@/lib/status";
import type { JobApplication } from "@/lib/types";

export const JOB_SEARCH_LOG_COLUMNS = [
  "Date Applied",
  "Name of Organization",
  "Address / Location",
  "Phone number & Contact Name",
  "Position Applied For & Notes",
] as const;

export function sortJobSearchLogApplications(applications: JobApplication[]) {
  return [...applications].sort((left, right) => {
    const byDate = left.dateApplied.localeCompare(right.dateApplied);
    if (byDate !== 0) return byDate;
    return left.organization.localeCompare(right.organization);
  });
}

export function jobSearchLogDate(application: JobApplication) {
  return formatDisplayDate(parseDateInput(application.dateApplied));
}

export function jobSearchLogContactLines(application: JobApplication) {
  return [application.contactName, application.phone, application.contactEmail]
    .map((value) => value.trim())
    .filter(Boolean);
}

export function jobSearchLogPositionLines(application: JobApplication) {
  const lines = [application.position.trim()];
  if (application.notes.trim()) lines.push(application.notes.trim());
  lines.push(`Status: ${STATUS_LABELS[application.status]}`);
  return lines.filter(Boolean);
}
