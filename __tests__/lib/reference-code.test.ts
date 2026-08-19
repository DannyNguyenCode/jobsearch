import { describe, expect, it } from "vitest";
import { generateRecruiterReferenceCode, normalizeReferenceCode } from "@/lib/reference-code";

describe("recruiter reference codes", () => {
  it("generates a human-shareable REC code", () => {
    const code = generateRecruiterReferenceCode();
    expect(code).toMatch(/^REC-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("normalizes spacing and case", () => {
    expect(normalizeReferenceCode(" rec-7k4p2m ")).toBe("REC-7K4P2M");
  });
});
