/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readResponse } from "../helpers";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth: (...args: unknown[]) => auth(...args) }));
vi.mock("@/lib/account-service", () => ({
  deleteApplicantAccount: vi.fn(),
  deleteRecruiterAccount: vi.fn(),
}));

import { DELETE } from "@/app/api/account/route";
import { deleteApplicantAccount, deleteRecruiterAccount } from "@/lib/account-service";

const applicant = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  role: "applicant" as const,
};

const recruiter = {
  id: "bbbbbbbbbbbbbbbbbbbbbbbb",
  role: "recruiter" as const,
};

describe("DELETE /api/account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets an applicant delete their account", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(deleteApplicantAccount).mockResolvedValue({ id: applicant.id });

    const { status, body } = await readResponse(await DELETE());

    expect(status).toBe(200);
    expect(body.deleted).toBe(true);
    expect(deleteApplicantAccount).toHaveBeenCalledWith(applicant.id);
    expect(deleteRecruiterAccount).not.toHaveBeenCalled();
  });

  it("lets a recruiter delete their account", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(deleteRecruiterAccount).mockResolvedValue({ id: recruiter.id });

    const { status, body } = await readResponse(await DELETE());

    expect(status).toBe(200);
    expect(body.deleted).toBe(true);
    expect(deleteRecruiterAccount).toHaveBeenCalledWith(recruiter.id);
    expect(deleteApplicantAccount).not.toHaveBeenCalled();
  });
});
