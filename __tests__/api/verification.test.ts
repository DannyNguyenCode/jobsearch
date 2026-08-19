/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, readResponse } from "../helpers";

vi.mock("@/lib/db", () => ({ dbConnect: vi.fn() }));
vi.mock("@/lib/models/User", () => ({
  User: {
    findOne: vi.fn(),
  },
}));
vi.mock("@/lib/auth-service", () => ({
  isCodeValid: vi.fn(),
  assignVerificationCode: vi.fn(),
}));

import { POST as verifyEmail } from "@/app/api/auth/verify-email/route";
import { POST as resendVerification } from "@/app/api/auth/resend-verification/route";
import { User } from "@/lib/models/User";
import { assignVerificationCode, isCodeValid } from "@/lib/auth-service";

const findOne = vi.mocked(User.findOne);
const codeValid = vi.mocked(isCodeValid);
const assignCode = vi.mocked(assignVerificationCode);

function selectChain(user: unknown) {
  return { select: vi.fn().mockResolvedValue(user) };
}

describe("POST /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies a valid code", async () => {
    const save = vi.fn();
    const set = vi.fn();
    findOne.mockReturnValue(selectChain({ emailVerified: null, save, set }) as never);
    codeValid.mockReturnValue(true);

    const { status, body } = await readResponse(
      await verifyEmail(jsonRequest({ email: "applicant@example.com", code: "123456" })),
    );

    expect(status).toBe(200);
    expect(body.verified).toBe(true);
    expect(save).toHaveBeenCalled();
  });

  it("rejects an invalid or expired code", async () => {
    findOne.mockReturnValue(selectChain({ emailVerified: null, save: vi.fn(), set: vi.fn() }) as never);
    codeValid.mockReturnValue(false);

    const { status, body } = await readResponse(
      await verifyEmail(jsonRequest({ email: "applicant@example.com", code: "000000" })),
    );

    expect(status).toBe(400);
    expect(body.error).toBe("Invalid or expired verification code.");
  });

  it("returns already verified when the account is confirmed", async () => {
    findOne.mockReturnValue(selectChain({ emailVerified: new Date(), save: vi.fn(), set: vi.fn() }) as never);

    const { status, body } = await readResponse(
      await verifyEmail(jsonRequest({ email: "applicant@example.com", code: "123456" })),
    );

    expect(status).toBe(200);
    expect(body.alreadyVerified).toBe(true);
  });
});

describe("POST /api/auth/resend-verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assignCode.mockResolvedValue(undefined);
  });

  it("sends a new code for an unverified account", async () => {
    const user = { emailVerified: null };
    findOne.mockReturnValue(selectChain(user) as never);

    const { status, body } = await readResponse(
      await resendVerification(jsonRequest({ email: "applicant@example.com" })),
    );

    expect(status).toBe(200);
    expect(body.sent).toBe(true);
    expect(assignCode).toHaveBeenCalledWith(user);
  });

  it("does not reveal whether an unknown email exists", async () => {
    findOne.mockReturnValue(selectChain(null) as never);

    const { status, body } = await readResponse(
      await resendVerification(jsonRequest({ email: "missing@example.com" })),
    );

    expect(status).toBe(200);
    expect(body.sent).toBe(true);
    expect(assignCode).not.toHaveBeenCalled();
  });

  it("rejects resend when the email is already verified", async () => {
    findOne.mockReturnValue(selectChain({ emailVerified: new Date() }) as never);

    const { status, body } = await readResponse(
      await resendVerification(jsonRequest({ email: "applicant@example.com" })),
    );

    expect(status).toBe(409);
    expect(body.error).toMatch(/already verified/i);
  });
});
