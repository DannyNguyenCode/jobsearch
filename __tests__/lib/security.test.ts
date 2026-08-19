import { describe, expect, it } from "vitest";
import { generateSixDigitCode, hashToken, isCodeValid, minutesFromNow, newEmailCode } from "@/lib/security";

describe("verification codes", () => {
  it("generates a 6-digit numeric code", () => {
    const code = generateSixDigitCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it("hashes tokens consistently", () => {
    expect(hashToken("123456")).toBe(hashToken("123456"));
    expect(hashToken("123456")).not.toBe(hashToken("654321"));
  });

  it("accepts a matching unexpired code", () => {
    const issued = newEmailCode();
    expect(isCodeValid(issued.code, issued.hash, issued.expires)).toBe(true);
  });

  it("rejects the wrong code", () => {
    const issued = newEmailCode();
    expect(isCodeValid("000000", issued.hash, issued.expires)).toBe(false);
  });

  it("rejects an expired code", () => {
    const issued = newEmailCode();
    expect(isCodeValid(issued.code, issued.hash, minutesFromNow(-1))).toBe(false);
  });
});
