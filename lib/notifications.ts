import { DOCUMENT_KIND_LABELS, type DocumentUploadKind } from "@/lib/document-kind";
import { STATUS_LABELS } from "@/lib/status";
import type { ApplicationStatus } from "@/lib/types";

export const NOTIFICATION_KINDS = [
  "applicant_connected",
  "application_added",
  "application_updated",
  "application_status",
  "application_comment",
  "application_document",
  "contact_updated",
  "relationship_ended",
] as const;

export type NotificationKind = (typeof NOTIFICATION_KINDS)[number];

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export function isNotificationKind(value: string): value is NotificationKind {
  return NOTIFICATION_KINDS.includes(value as NotificationKind);
}

export function connectedProfileLine() {
  return "Connected their profile";
}

export function addedApplicationLine() {
  return "Added an application";
}

export function updatedApplicationLine() {
  return "Updated application";
}

export function applicationStatusLine(status: ApplicationStatus) {
  return STATUS_LABELS[status];
}

export function commentAddedLine() {
  return "Comment added";
}

export function documentUploadedLine(kind: DocumentUploadKind) {
  return `${DOCUMENT_KIND_LABELS[kind]} uploaded`;
}

export function contactUpdatedLine(changes: { contact: boolean; preferences: boolean }) {
  if (changes.contact && changes.preferences) return "Updated their profile";
  if (changes.preferences) return "Updated job preferences";
  return "Updated contact information";
}

export function relationshipEndedLine() {
  return "Ended the coaching relationship";
}

export function accountDeletedLine() {
  return "Deleted their account";
}

export function recruiterApplicationHref(applicantId: string, applicationId: string) {
  return `/recruiter/applicants/${applicantId}/applications/${applicationId}`;
}

export function recruiterApplicantHref(applicantId: string) {
  return `/recruiter/applicants/${applicantId}`;
}

export function applicantApplicationHref(applicationId: string) {
  return `/applicant/applications/${applicationId}`;
}
