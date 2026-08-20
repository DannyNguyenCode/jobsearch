import { STATUS_LABELS } from "@/lib/status";
import type { ApplicationStatus } from "@/lib/types";

type TimelineTone = "primary" | "secondary" | "neutral" | "success";

export type StatusTimelineEvent = {
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  tone: TimelineTone;
  status: ApplicationStatus;
};

type TimelineLike = {
  status?: ApplicationStatus | null;
  title?: string;
  timestamp?: Date | null;
};

const LEGACY_STATUS_TITLES = new Map<string, ApplicationStatus>([
  ["Take Assessment", "assessment"],
  ["Interview Scheduled", "interview"],
]);

export function isStatusTimelineEvent(event: TimelineLike) {
  if (event.status) return true;
  return Object.values(STATUS_LABELS).includes(event.title ?? "") || LEGACY_STATUS_TITLES.has(event.title ?? "");
}

export function eventMatchesStatus(event: TimelineLike, status: ApplicationStatus) {
  if (event.status) return event.status === status;
  return event.title === STATUS_LABELS[status] || LEGACY_STATUS_TITLES.get(event.title ?? "") === status;
}

export function statusTimelineEvent(
  status: ApplicationStatus,
  organization: string,
  date: Date,
): StatusTimelineEvent {
  return {
    title: STATUS_LABELS[status],
    description: organization,
    timestamp: date,
    icon: iconForStatus(status),
    tone: toneForStatus(status),
    status,
  };
}

export function latestStatusEventDate(events: TimelineLike[], status: ApplicationStatus, fallback: Date) {
  const match = [...events]
    .filter((event) => eventMatchesStatus(event, status))
    .sort((left, right) => (right.timestamp?.getTime() ?? 0) - (left.timestamp?.getTime() ?? 0))[0];
  return match?.timestamp ?? fallback;
}

export function recordStatusDate(
  timeline: TimelineLike[],
  options: {
    previousStatus: ApplicationStatus;
    nextStatus: ApplicationStatus;
    date: Date;
    organization: string;
  },
) {
  const { previousStatus, nextStatus, date, organization } = options;
  if (nextStatus !== previousStatus) {
    timeline.push(statusTimelineEvent(nextStatus, organization, date));
    return;
  }

  const latest = [...timeline].reverse().find((event) => eventMatchesStatus(event, nextStatus));
  if (latest) {
    latest.timestamp = date;
    latest.title = STATUS_LABELS[nextStatus];
    latest.status = nextStatus;
    return;
  }

  timeline.push(statusTimelineEvent(nextStatus, organization, date));
}

function iconForStatus(status: ApplicationStatus) {
  switch (status) {
    case "offer":
      return "handshake";
    case "interview":
      return "video_camera_front";
    case "assessment":
      return "quiz";
    case "rejected":
    case "withdrawn":
      return "cancel";
    case "archived":
      return "inventory_2";
    default:
      return "flag";
  }
}

function toneForStatus(status: ApplicationStatus): TimelineTone {
  if (status === "offer") return "success";
  if (status === "rejected" || status === "withdrawn" || status === "archived") return "neutral";
  if (status === "applied" || status === "planning") return "primary";
  return "secondary";
}
