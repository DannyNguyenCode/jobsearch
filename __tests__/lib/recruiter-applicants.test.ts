/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { userFind, userFindOne, applicationFind, applicationAggregate } = vi.hoisted(() => ({
  userFind: vi.fn(),
  userFindOne: vi.fn(),
  applicationFind: vi.fn(),
  applicationAggregate: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ dbConnect: vi.fn() }));

vi.mock("@/lib/models/User", () => ({
  User: { find: userFind, findOne: userFindOne },
}));

vi.mock("@/lib/models/Application", () => ({
  Application: { find: applicationFind, aggregate: applicationAggregate },
}));

import { Application } from "@/lib/models/Application";
import { User } from "@/lib/models/User";
import {
  listManagedApplicantSummaries,
  loadLinkedApplicantForRecruiter,
  loadRecruiterApplicantWorkspace,
} from "@/lib/application-service";

const recruiterCode = "REC-7K4P2M";
const dannyId = "aaaaaaaaaaaaaaaaaaaaaaaa";
const janeId = "bbbbbbbbbbbbbbbbbbbbbbbb";
const outsiderId = "ffffffffffffffffffffffff";

const dannyUser = {
  _id: dannyId,
  fullName: "Danny Nguyen",
  email: "danny@example.com",
  role: "applicant",
  referenceCode: recruiterCode,
};

function mockLinkedApplicants(users: unknown[]) {
  userFind.mockReturnValue({
    sort: vi.fn().mockResolvedValue(users),
  });
}

describe("recruiter applicant authorization and summaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a linked applicant for the authenticated recruiter", async () => {
    userFindOne.mockResolvedValue(dannyUser);

    const applicant = await loadLinkedApplicantForRecruiter(dannyId, recruiterCode);

    expect(applicant?.id).toBe(dannyId);
    expect(applicant?.name).toBe("Danny Nguyen");
    expect(User.findOne).toHaveBeenCalledWith({
      _id: dannyId,
      role: "applicant",
      referenceCode: recruiterCode,
    });
  });

  it("rejects an applicant the recruiter does not manage", async () => {
    userFindOne.mockResolvedValue(null);

    await expect(loadLinkedApplicantForRecruiter(outsiderId, recruiterCode)).resolves.toBeNull();
    await expect(loadRecruiterApplicantWorkspace(outsiderId, recruiterCode)).resolves.toBeNull();
    expect(Application.aggregate).not.toHaveBeenCalled();
    expect(Application.find).not.toHaveBeenCalled();
  });

  it("does not treat an empty recruiter code as authorization", async () => {
    await expect(loadRecruiterApplicantWorkspace(dannyId, "")).resolves.toBeNull();
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it("builds sidebar summaries without loading full application documents", async () => {
    mockLinkedApplicants([dannyUser]);
    applicationAggregate
      .mockResolvedValueOnce([
        {
          _id: dannyId,
          activeCount: 2,
          interviewCount: 1,
          offerCount: 0,
          lastActivityAt: new Date("2026-08-18T12:00:00.000Z"),
        },
      ])
      .mockResolvedValueOnce([{ _id: dannyId, jobField: "Web Developer" }]);

    const summaries = await listManagedApplicantSummaries(recruiterCode);

    expect(summaries).toEqual([
      {
        id: dannyId,
        name: "Danny Nguyen",
        email: "danny@example.com",
        initials: "DN",
        jobField: "Web Developer",
        activeCount: 2,
        interviewCount: 1,
        offerCount: 0,
        lastActivityAt: "2026-08-18T12:00:00.000Z",
      },
    ]);
    expect(Application.find).not.toHaveBeenCalled();
    expect(Application.aggregate).toHaveBeenCalledTimes(2);
  });

  it("scopes workspace applications to the authorized applicant after the relationship check", async () => {
    userFindOne.mockResolvedValue(dannyUser);
    mockLinkedApplicants([dannyUser]);
    applicationAggregate.mockResolvedValue([]);
    applicationFind.mockReturnValue({
      sort: vi.fn().mockResolvedValue([
        {
          _id: janeId,
          applicantId: dannyId,
          position: "Frontend Engineer",
          organization: "TechCorp",
          location: "Remote",
          postingUrl: "",
          source: "jobBoard",
          contactName: "",
          contactEmail: "",
          phone: "",
          notes: "",
          dateApplied: new Date("2026-08-01"),
          status: "applied",
          documents: [],
          comments: [],
          timeline: [],
        },
      ]),
    });

    const loaded = await loadRecruiterApplicantWorkspace(dannyId, recruiterCode);

    expect(loaded?.applicant.id).toBe(dannyId);
    expect(loaded?.applications).toHaveLength(1);
    expect(loaded?.applications[0]?.organization).toBe("TechCorp");
    expect(loaded?.applications[0]?.applicantId).toBe(dannyId);
    expect(Application.find).toHaveBeenCalledWith({
      applicantId: dannyId,
      status: { $nin: ["archived", "rejected", "withdrawn"] },
    });
  });
});
