import { describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { nextActionFor, STATUS_LABELS, STATUS_OPTIONS } from "@/lib/status";
import { initialsFromName } from "@/lib/applicant-view";
import { parseDateInput, toDateInput } from "@/lib/dates";
import { isObjectId, objectIdTime } from "@/lib/object-id";
import { canReadApplications, canWriteApplications } from "@/lib/application-access";
import { recentUpdatesFrom } from "@/lib/application-service";
import type { JobApplication, TimelineEvent } from "@/lib/types";

describe("application helpers", () => {
  it("exposes the selectable application statuses", () => {
    expect(STATUS_OPTIONS).toEqual([
      "planning",
      "applied",
      "screening",
      "assessment",
      "interview",
      "offer",
      "rejected",
      "withdrawn",
    ]);
    expect(STATUS_LABELS.assessment).toBe("Assessment");
    expect(STATUS_LABELS.interview).toBe("Interview");
  });

  it("suggests a next action from status", () => {
    expect(nextActionFor("interview")).toBe("Prepare for interview");
    expect(nextActionFor("archived")).toBe("View archive");
  });

  it("builds initials from a name", () => {
    expect(initialsFromName("Danny Nguyen")).toBe("DN");
  });

  it("round-trips a date input", () => {
    expect(toDateInput(parseDateInput("2026-08-18"))).toBe("2026-08-18");
  });

  it("accepts 24-character object ids", () => {
    expect(isObjectId("cccccccccccccccccccccccc")).toBe(true);
    expect(isObjectId("not-an-id")).toBe(false);
  });

  it("reads the timestamp encoded in an object id", () => {
    const id = mongoose.Types.ObjectId.createFromTime(Math.floor(Date.parse("2026-08-20T16:00:00.000Z") / 1000));
    expect(objectIdTime(String(id))).toBe(Date.parse("2026-08-20T16:00:00.000Z"));
  });

  it("lets applicants write and recruiters only read", () => {
    expect(canWriteApplications("applicant")).toBe(true);
    expect(canWriteApplications("recruiter")).toBe(false);
    expect(canReadApplications("applicant")).toBe(true);
    expect(canReadApplications("recruiter")).toBe(true);
  });
});

function idAt(iso: string) {
  return String(mongoose.Types.ObjectId.createFromTime(Math.floor(Date.parse(iso) / 1000)));
}

function event(overrides: Partial<TimelineEvent> & Pick<TimelineEvent, "id" | "title">): TimelineEvent {
  return {
    description: "",
    timestamp: "",
    icon: "history",
    ...overrides,
  };
}

function application(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: idAt("2026-08-01T00:00:00.000Z"),
    dateApplied: "2026-08-01",
    organization: "TechCorp",
    location: "Remote",
    phone: "",
    contactName: "",
    contactEmail: "",
    position: "Engineer",
    notes: "",
    status: "applied",
    postingUrl: "",
    source: "jobBoard",
    applicantId: "aaaaaaaaaaaaaaaaaaaaaaaa",
    documents: [],
    comments: [],
    timeline: [],
    ...overrides,
  };
}

describe("recentUpdatesFrom", () => {
  it("surfaces a new comment ahead of older events on other applications", () => {
    const updates = recentUpdatesFrom([
      application({
        organization: "Northwind",
        timeline: [
          event({ id: idAt("2026-08-10T12:00:00.000Z"), title: "Applied" }),
          event({ id: idAt("2026-08-11T12:00:00.000Z"), title: "Interview" }),
          event({ id: idAt("2026-08-12T12:00:00.000Z"), title: "Resume uploaded" }),
        ],
      }),
      application({
        organization: "TechCorp",
        timeline: [event({ id: idAt("2026-08-20T15:00:00.000Z"), title: "Comment added" })],
      }),
    ]);

    expect(updates.map((item) => item.title)).toEqual(["Comment added", "Resume uploaded", "Interview"]);
    expect(updates[0]?.organization).toBe("TechCorp");
  });
});
