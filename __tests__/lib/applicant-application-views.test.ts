import { describe, expect, it } from "vitest";
import {
  ACTION_REQUIRED_STATUSES,
  applicantApplicationsCopy,
  applicationsForView,
  parseApplicantApplicationsView,
} from "@/lib/applicant-application-views";
import type { JobApplication } from "@/lib/types";

function application(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: "dddddddddddddddddddddddd",
    dateApplied: "2026-08-01",
    organization: "TechCorp",
    location: "Remote",
    phone: "",
    contactName: "",
    contactEmail: "",
    position: "Frontend Engineer",
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

describe("applicant application views", () => {
  it("parses dashboard deep links", () => {
    expect(parseApplicantApplicationsView(undefined)).toBe("all");
    expect(parseApplicantApplicationsView("schedule")).toBe("schedule");
    expect(parseApplicantApplicationsView("pending")).toBe("pending");
    expect(parseApplicantApplicationsView(["pending"])).toBe("pending");
    expect(parseApplicantApplicationsView("unknown")).toBe("all");
  });

  it("filters interviews and sorts by upcoming interview date", () => {
    const rows = applicationsForView(
      [
        application({ id: "later", status: "interview", statusDate: "2026-09-20", dateApplied: "2026-08-01" }),
        application({ id: "soon", status: "interview", statusDate: "2026-09-02", dateApplied: "2026-08-10" }),
        application({ id: "applied", status: "applied", statusDate: "2026-08-01" }),
      ],
      "schedule",
    );
    expect(rows.map((row) => row.id)).toEqual(["soon", "later"]);
  });

  it("lists assessments and offers as pending actions", () => {
    expect(ACTION_REQUIRED_STATUSES).toEqual(["assessment", "offer"]);
    const rows = applicationsForView(
      [
        application({ id: "offer", status: "offer", statusDate: "2026-09-10" }),
        application({ id: "screen", status: "screening" }),
        application({ id: "assessment", status: "assessment", statusDate: "2026-09-01" }),
      ],
      "pending",
    );
    expect(rows.map((row) => row.id)).toEqual(["assessment", "offer"]);
  });

  it("uses focused copy for schedule and pending views", () => {
    expect(applicantApplicationsCopy("schedule").title).toBe("Interview schedule");
    expect(applicantApplicationsCopy("pending").title).toBe("Pending actions");
  });
});
