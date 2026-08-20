import { describe, expect, it } from "vitest";
import {
  JOB_SEARCH_LOG_COLUMNS,
  jobSearchLogContactLines,
  jobSearchLogDate,
  jobSearchLogPositionLines,
  sortJobSearchLogApplications,
} from "@/lib/job-search-log";
import type { JobApplication } from "@/lib/types";

function application(overrides: Partial<JobApplication> = {}): JobApplication {
  return {
    id: "1",
    dateApplied: "2026-08-18",
    organization: "Intact Insurance",
    location: "Mississauga, ON",
    phone: "+1 416 555 0100",
    contactName: "Jane Smith",
    contactEmail: "jane@example.com",
    position: "Claims Customer Service Representative",
    notes: "Applied through Indeed.",
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

describe("CCRW job search log", () => {
  it("uses the CCRW log columns", () => {
    expect(JOB_SEARCH_LOG_COLUMNS).toEqual([
      "Date Applied",
      "Name of Organization",
      "Address / Location",
      "Phone number & Contact Name",
      "Position Applied For & Notes",
    ]);
  });

  it("formats contact and position columns", () => {
    const row = application();
    expect(jobSearchLogDate(row)).toBe("Aug 18, 2026");
    expect(jobSearchLogContactLines(row)).toEqual(["Jane Smith", "+1 416 555 0100", "jane@example.com"]);
    expect(jobSearchLogPositionLines(row)).toEqual([
      "Claims Customer Service Representative",
      "Applied through Indeed.",
      "Status: Applied",
    ]);
  });

  it("sorts the log by date applied", () => {
    const rows = sortJobSearchLogApplications([
      application({ id: "2", dateApplied: "2026-09-01", organization: "Beta" }),
      application({ id: "1", dateApplied: "2026-08-01", organization: "Alpha" }),
    ]);
    expect(rows.map((row) => row.id)).toEqual(["1", "2"]);
  });
});
