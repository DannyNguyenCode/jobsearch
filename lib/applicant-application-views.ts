import type { ApplicationStatus, JobApplication } from "@/lib/types";

export const ACTION_REQUIRED_STATUSES: ApplicationStatus[] = ["assessment", "offer"];

export type ApplicantApplicationsView = "all" | "schedule" | "pending";

export function parseApplicantApplicationsView(value: string | string[] | undefined): ApplicantApplicationsView {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === "schedule" || raw === "pending") return raw;
  return "all";
}

export function applicationViewDate(application: JobApplication) {
  return application.statusDate ?? application.dateApplied;
}

export function filterApplicantApplications(applications: JobApplication[], view: ApplicantApplicationsView) {
  if (view === "schedule") {
    return applications.filter((application) => application.status === "interview");
  }
  if (view === "pending") {
    return applications.filter((application) => ACTION_REQUIRED_STATUSES.includes(application.status));
  }
  return applications;
}

export function sortApplicantApplications(applications: JobApplication[], view: ApplicantApplicationsView) {
  const rows = [...applications];
  const comparison = (left: JobApplication, right: JobApplication) =>
    applicationViewDate(left).localeCompare(applicationViewDate(right));
  if (view === "schedule" || view === "pending") {
    return rows.sort(comparison);
  }
  return rows.sort((left, right) => comparison(right, left));
}

export function applicationsForView(applications: JobApplication[], view: ApplicantApplicationsView) {
  return sortApplicantApplications(filterApplicantApplications(applications, view), view);
}

export function applicantApplicationsCopy(view: ApplicantApplicationsView) {
  switch (view) {
    case "schedule":
      return {
        title: "Interview schedule",
        description: "Applications currently in Interview, sorted by interview date.",
        emptyTitle: "No interviews scheduled",
        emptyDescription: "When an application moves to Interview, it will show up here.",
        dateHeader: "Interview date",
      };
    case "pending":
      return {
        title: "Pending actions",
        description: "Assessments and offers that need your review.",
        emptyTitle: "Nothing to review",
        emptyDescription: "Assessments and offers will appear here when they need your attention.",
        dateHeader: "Date",
      };
    default:
      return {
        title: "Applications",
        description: "Every job still in your tracker. Archived applications are in a separate list.",
        emptyTitle: "No active applications",
        emptyDescription: "Log a job you already applied to and it will appear here until you archive it.",
        dateHeader: "Date",
      };
  }
}
