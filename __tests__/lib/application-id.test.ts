import { describe, expect, it } from "vitest";
import {
  APPLICATION_ID_PATTERN,
  generateApplicationId,
  isApplicationId,
} from "@/lib/application-id";

describe("applicationId", () => {
  it("generates a URL-safe APP code", () => {
    const applicationId = generateApplicationId();
    expect(applicationId).toMatch(APPLICATION_ID_PATTERN);
    expect(isApplicationId(applicationId)).toBe(true);
  });

  it("produces distinct identifiers", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateApplicationId()));
    expect(ids.size).toBe(50);
  });
});
