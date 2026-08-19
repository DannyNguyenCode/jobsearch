import { describe, expect, it } from "vitest";
import {
  isRememberDevice,
  REMEMBER_MAX_AGE,
  sessionMaxAgeSeconds,
  TEMP_MAX_AGE,
} from "@/lib/session-duration";

describe("remember this device", () => {
  it("keeps the user signed in for 30 days when checked", () => {
    expect(isRememberDevice("true")).toBe(true);
    expect(isRememberDevice(undefined)).toBe(true);
    expect(sessionMaxAgeSeconds(true)).toBe(REMEMBER_MAX_AGE);
    expect(REMEMBER_MAX_AGE).toBe(30 * 24 * 60 * 60);
  });

  it("uses a 12-hour session when the checkbox is unchecked", () => {
    expect(isRememberDevice("false")).toBe(false);
    expect(sessionMaxAgeSeconds(false)).toBe(TEMP_MAX_AGE);
    expect(TEMP_MAX_AGE).toBe(12 * 60 * 60);
  });
});
