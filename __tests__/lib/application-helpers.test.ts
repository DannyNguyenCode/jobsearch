import { describe, expect, it } from "vitest";
import { nextActionFor, STATUS_LABELS, STATUS_OPTIONS } from "@/lib/status";
import { initialsFromName } from "@/lib/applicant-view";
import { parseDateInput, toDateInput } from "@/lib/dates";
import { isObjectId } from "@/lib/object-id";
import { canReadApplications, canWriteApplications } from "@/lib/application-access";

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

  it("lets applicants write and recruiters only read", () => {
    expect(canWriteApplications("applicant")).toBe(true);
    expect(canWriteApplications("recruiter")).toBe(false);
    expect(canReadApplications("applicant")).toBe(true);
    expect(canReadApplications("recruiter")).toBe(true);
  });
});
