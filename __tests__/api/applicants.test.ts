/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, readResponse } from "../helpers";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth: (...args: unknown[]) => auth(...args) }));

vi.mock("@/lib/application-service", () => ({
  listLinkedApplicants: vi.fn(),
  loadApplicantForRecruiter: vi.fn(),
  unlinkApplicantFromRecruiter: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendRecruiterUnlinkedEmail: vi.fn(),
}));

import { GET as listApplicants } from "@/app/api/applicants/route";
import { GET as getApplicant } from "@/app/api/applicants/[id]/route";
import { DELETE as unlinkApplicant } from "@/app/api/applicants/[id]/link/route";
import {
  listLinkedApplicants,
  loadApplicantForRecruiter,
  unlinkApplicantFromRecruiter,
} from "@/lib/application-service";
import { sendRecruiterUnlinkedEmail } from "@/lib/email";

const applicant = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  role: "applicant" as const,
  fullName: "Danny Nguyen",
  referenceCode: "REC-7K4P2M",
};

const recruiter = {
  id: "bbbbbbbbbbbbbbbbbbbbbbbb",
  role: "recruiter" as const,
  fullName: "Alex Rivers",
  referenceCode: "REC-7K4P2M",
};

const linkedApplicant = {
  id: applicant.id,
  name: "Danny Nguyen",
  email: "danny@example.com",
};

const linkedApplication = {
  id: "cccccccccccccccccccccccc",
  position: "Frontend Engineer",
  organization: "TechCorp",
  applicantId: applicant.id,
};

const params = Promise.resolve({ id: applicant.id });

describe("GET /api/applicants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists applicants who stored the recruiter's reference code", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(listLinkedApplicants).mockResolvedValue([linkedApplicant] as never);

    const { status, body } = await readResponse(await listApplicants());

    expect(status).toBe(200);
    expect(body.applicants).toEqual([linkedApplicant]);
    expect(listLinkedApplicants).toHaveBeenCalledWith("REC-7K4P2M");
  });

  it("does not let an applicant list recruiter rosters", async () => {
    auth.mockResolvedValue({ user: applicant });
    const { status } = await readResponse(await listApplicants());
    expect(status).toBe(403);
    expect(listLinkedApplicants).not.toHaveBeenCalled();
  });
});

describe("GET /api/applicants/[id]", () => {
  it("lets a recruiter view a linked applicant's job applications", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicantForRecruiter).mockResolvedValue({
      applicant: linkedApplicant,
      applications: [linkedApplication],
    } as never);

    const { status, body } = await readResponse(
      await getApplicant(new Request("http://localhost/api/applicants/aaaaaaaaaaaaaaaaaaaaaaaa"), { params }),
    );

    expect(status).toBe(200);
    expect(body.applicant).toEqual(linkedApplicant);
    expect(body.applications).toEqual([linkedApplication]);
    expect(loadApplicantForRecruiter).toHaveBeenCalledWith(applicant.id, recruiter.referenceCode);
  });

  it("hides applicants who are not linked to that recruiter", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicantForRecruiter).mockResolvedValue(null);

    const { status } = await readResponse(
      await getApplicant(new Request("http://localhost/api/applicants/aaaaaaaaaaaaaaaaaaaaaaaa"), { params }),
    );

    expect(status).toBe(404);
  });
});

describe("DELETE /api/applicants/[id]/link", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets a recruiter remove the relationship and emails the applicant", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(unlinkApplicantFromRecruiter).mockResolvedValue({
      id: applicant.id,
      name: "Danny Nguyen",
      email: "danny@example.com",
    });
    vi.mocked(sendRecruiterUnlinkedEmail).mockResolvedValue(undefined);

    const { status, body } = await readResponse(
      await unlinkApplicant(new Request("http://localhost/api", { method: "DELETE" }), { params }),
    );

    expect(status).toBe(200);
    expect(body.unlinked).toBe(true);
    expect(body.emailSent).toBe(true);
    expect(unlinkApplicantFromRecruiter).toHaveBeenCalledWith(applicant.id, "REC-7K4P2M");
    expect(sendRecruiterUnlinkedEmail).toHaveBeenCalledWith(
      "danny@example.com",
      "Danny Nguyen",
      "Alex Rivers",
    );
  });

  it("rejects an applicant ending the recruiter relationship from this route", async () => {
    auth.mockResolvedValue({ user: applicant });
    const { status } = await readResponse(
      await unlinkApplicant(new Request("http://localhost/api", { method: "DELETE" }), { params }),
    );
    expect(status).toBe(403);
    expect(unlinkApplicantFromRecruiter).not.toHaveBeenCalled();
  });
});
