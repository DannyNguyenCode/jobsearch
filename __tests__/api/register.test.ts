/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, readResponse } from "../helpers";

vi.mock("@/lib/db", () => ({ dbConnect: vi.fn() }));
vi.mock("@/lib/models/User", () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));
vi.mock("@/lib/auth-service", () => ({
  allocateRecruiterReferenceCode: vi.fn(),
  assignVerificationCode: vi.fn(),
  hashPassword: vi.fn(),
  isDuplicateKeyError: vi.fn(() => false),
}));

import { POST } from "@/app/api/auth/register/route";
import { User } from "@/lib/models/User";
import {
  allocateRecruiterReferenceCode,
  assignVerificationCode,
  hashPassword,
} from "@/lib/auth-service";

const findOne = vi.mocked(User.findOne);
const create = vi.mocked(User.create);
const allocateCode = vi.mocked(allocateRecruiterReferenceCode);
const assignCode = vi.mocked(assignVerificationCode);
const hash = vi.mocked(hashPassword);

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hash.mockResolvedValue("hashed-password");
    assignCode.mockResolvedValue(undefined);
    findOne.mockResolvedValue(null);
  });

  it("creates an applicant without a recruiter code", async () => {
    create.mockResolvedValue({ email: "applicant@example.com" } as never);

    const { status, body } = await readResponse(
      await POST(
        jsonRequest({
          fullName: "Danny Nguyen",
          email: "applicant@example.com",
          password: "adminadmin",
          role: "applicant",
        }),
      ),
    );

    expect(status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.email).toBe("applicant@example.com");
    expect(body.emailSent).toBe(true);
    expect(allocateCode).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: "Danny Nguyen",
        email: "applicant@example.com",
        role: "applicant",
        referenceCode: "",
        password: "hashed-password",
      }),
    );
    expect(assignCode).toHaveBeenCalled();
  });

  it("creates a recruiter with a generated reference code", async () => {
    allocateCode.mockResolvedValue("REC-7K4P2M");
    create.mockResolvedValue({ email: "recruiter@example.com" } as never);

    const { status, body } = await readResponse(
      await POST(
        jsonRequest({
          fullName: "Alex Rivers",
          email: "recruiter@example.com",
          password: "password1",
          role: "recruiter",
        }),
      ),
    );

    expect(status).toBe(201);
    expect(body.email).toBe("recruiter@example.com");
    expect(allocateCode).toHaveBeenCalled();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "recruiter",
        referenceCode: "REC-7K4P2M",
      }),
    );
  });

  it("rejects a duplicate email", async () => {
    findOne.mockResolvedValue({ email: "applicant@example.com" } as never);

    const { status, body } = await readResponse(
      await POST(
        jsonRequest({
          fullName: "Danny Nguyen",
          email: "applicant@example.com",
          password: "adminadmin",
          role: "applicant",
        }),
      ),
    );

    expect(status).toBe(409);
    expect(body.error).toBe("An account with this email already exists.");
    expect(create).not.toHaveBeenCalled();
  });

  it("still creates the account if the verification email fails", async () => {
    create.mockResolvedValue({ email: "applicant@example.com" } as never);
    assignCode.mockRejectedValue(new Error("Resend failed"));

    const { status, body } = await readResponse(
      await POST(
        jsonRequest({
          fullName: "Danny Nguyen",
          email: "applicant@example.com",
          password: "adminadmin",
          role: "applicant",
        }),
      ),
    );

    expect(status).toBe(201);
    expect(body.emailSent).toBe(false);
  });

  it("rejects invalid input", async () => {
    const { status } = await readResponse(
      await POST(
        jsonRequest({
          fullName: "D",
          email: "not-an-email",
          password: "short",
          role: "applicant",
        }),
      ),
    );
    expect(status).toBe(400);
  });
});
