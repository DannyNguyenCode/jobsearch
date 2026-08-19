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
  assignPasswordResetCode: vi.fn(),
  hashPassword: vi.fn(),
  isCodeValid: vi.fn(),
}));

import { POST as forgotPassword } from "@/app/api/auth/forgot-password/route";
import { POST as resetPassword } from "@/app/api/auth/reset-password/route";
import { User } from "@/lib/models/User";
import { assignPasswordResetCode, hashPassword, isCodeValid } from "@/lib/auth-service";

const findOne = vi.mocked(User.findOne);
const assignReset = vi.mocked(assignPasswordResetCode);
const codeValid = vi.mocked(isCodeValid);
const hash = vi.mocked(hashPassword);

function selectChain(user: unknown) {
  return { select: vi.fn().mockResolvedValue(user) };
}

describe("POST /api/auth/forgot-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    assignReset.mockResolvedValue(undefined);
  });

  it("sends a reset code when the account exists", async () => {
    const user = { email: "applicant@example.com" };
    findOne.mockReturnValue(selectChain(user) as never);

    const { status, body } = await readResponse(
      await forgotPassword(jsonRequest({ email: "applicant@example.com" })),
    );

    expect(status).toBe(200);
    expect(body.sent).toBe(true);
    expect(assignReset).toHaveBeenCalledWith(user);
  });

  it("returns success even when the email is unknown", async () => {
    findOne.mockReturnValue(selectChain(null) as never);

    const { status, body } = await readResponse(
      await forgotPassword(jsonRequest({ email: "missing@example.com" })),
    );

    expect(status).toBe(200);
    expect(body.sent).toBe(true);
    expect(assignReset).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/reset-password", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hash.mockResolvedValue("new-hash");
  });

  it("updates the password when the code is valid", async () => {
    const save = vi.fn();
    const set = vi.fn();
    findOne.mockReturnValue(selectChain({ save, set }) as never);
    codeValid.mockReturnValue(true);

    const { status, body } = await readResponse(
      await resetPassword(
        jsonRequest({
          email: "applicant@example.com",
          code: "123456",
          password: "newpassword",
        }),
      ),
    );

    expect(status).toBe(200);
    expect(body.reset).toBe(true);
    expect(hash).toHaveBeenCalledWith("newpassword");
    expect(save).toHaveBeenCalled();
  });

  it("rejects an invalid reset code", async () => {
    findOne.mockReturnValue(selectChain({ save: vi.fn(), set: vi.fn() }) as never);
    codeValid.mockReturnValue(false);

    const { status, body } = await readResponse(
      await resetPassword(
        jsonRequest({
          email: "applicant@example.com",
          code: "000000",
          password: "newpassword",
        }),
      ),
    );

    expect(status).toBe(400);
    expect(body.error).toBe("Invalid or expired reset code.");
  });
});
