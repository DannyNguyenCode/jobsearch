import { describe, expect, it } from "vitest";
import {
  filterAndSortApplications,
  filterManagedApplicants,
  mergeSelectedApplicantSummary,
  selectDefaultManagedApplicantId,
  type ManagedApplicantSummary,
} from "@/lib/managed-applicants";
import type { JobApplication } from "@/lib/types";

const danny: ManagedApplicantSummary = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  name: "Danny Nguyen",
  email: "danny@example.com",
  initials: "DN",
  jobField: "Web Developer",
  phone: "",
  location: "",
  openToRelocation: false,
  remotePreferred: false,
  activeCount: 2,
  interviewCount: 1,
  offerCount: 0,
  lastActivityAt: "2026-08-10T00:00:00.000Z",
};

const jane: ManagedApplicantSummary = {
  id: "bbbbbbbbbbbbbbbbbbbbbbbb",
  name: "Jane Smith",
  email: "jane@example.com",
  initials: "JS",
  jobField: "Customer Service",
  phone: "",
  location: "",
  openToRelocation: false,
  remotePreferred: false,
  activeCount: 1,
  interviewCount: 0,
  offerCount: 1,
  lastActivityAt: "2026-08-18T00:00:00.000Z",
};

const john: ManagedApplicantSummary = {
  id: "cccccccccccccccccccccccc",
  name: "John Doe",
  email: "john@example.com",
  initials: "JD",
  jobField: "",
  phone: "",
  location: "",
  openToRelocation: false,
  remotePreferred: false,
  activeCount: 0,
  interviewCount: 0,
  offerCount: 0,
  lastActivityAt: null,
};

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
    applicantId: danny.id,
    documents: [],
    comments: [],
    timeline: [],
    ...overrides,
  };
}

describe("selectDefaultManagedApplicantId", () => {
  it("returns null when the recruiter has no applicants", () => {
    expect(selectDefaultManagedApplicantId([])).toBeNull();
  });

  it("selects the applicant with the most recent activity", () => {
    expect(selectDefaultManagedApplicantId([danny, jane, john])).toBe(jane.id);
  });

  it("falls back to the first canonical applicant when nobody has activity", () => {
    expect(selectDefaultManagedApplicantId([{ ...danny, lastActivityAt: null }, john])).toBe(danny.id);
  });
});

describe("filterManagedApplicants", () => {
  it("filters by name, email, or job field", () => {
    const applicants = [danny, jane, john];
    expect(filterManagedApplicants(applicants, "jane")).toEqual([jane]);
    expect(filterManagedApplicants(applicants, "danny@")).toEqual([danny]);
    expect(filterManagedApplicants(applicants, "web")).toEqual([danny]);
  });
});

describe("filterAndSortApplications", () => {
  const rows = [
    application({ id: "1", organization: "TechCorp", position: "Engineer", dateApplied: "2026-08-10", status: "interview" }),
    application({ id: "2", organization: "Acme", position: "Analyst", dateApplied: "2026-08-01", status: "applied" }),
  ];

  it("filters by search and status, then sorts by date", () => {
    expect(filterAndSortApplications(rows, { query: "acme", status: "all", sort: "newest" }).map((row) => row.id)).toEqual([
      "2",
    ]);
    expect(
      filterAndSortApplications(rows, { query: "", status: "interview", sort: "oldest" }).map((row) => row.id),
    ).toEqual(["1"]);
    expect(filterAndSortApplications(rows, { query: "", status: "all", sort: "oldest" }).map((row) => row.id)).toEqual([
      "2",
      "1",
    ]);
  });
});

describe("mergeSelectedApplicantSummary", () => {
  it("prefers authorized applicant identity over sidebar summary copies", () => {
    const merged = mergeSelectedApplicantSummary(
      { id: danny.id, name: "Danny Nguyen", email: "giabnguyen1@gmail.com", initials: "DN", title: "Applicant" },
      [danny],
      [application()],
    );
    expect(merged.email).toBe("giabnguyen1@gmail.com");
    expect(merged.activeCount).toBe(2);
  });
});
