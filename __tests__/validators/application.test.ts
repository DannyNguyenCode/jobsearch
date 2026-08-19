import { describe, expect, it } from "vitest";
import { applicationCommentSchema, applicationInputSchema, applicationUpdateSchema } from "@/lib/validators/application";

describe("applicationInputSchema", () => {
  it("accepts a logged application", () => {
    const parsed = applicationInputSchema.safeParse({
      position: "Senior Frontend Engineer",
      organization: "TechCorp Inc.",
      location: "Remote",
      postingUrl: "https://example.com/jobs/frontend",
      source: "companySite",
      contactName: "Jordan Hale",
      contactEmail: "jordan@example.com",
      phone: "555-0100",
      notes: "Heard back from the recruiter.",
      dateApplied: "2026-08-18",
      status: "applied",
    });
    expect(parsed.success).toBe(true);
  });

  it("defaults optional fields", () => {
    const parsed = applicationInputSchema.safeParse({
      position: "Designer",
      organization: "Studio",
      source: "other",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.status).toBe("applied");
      expect(parsed.data.location).toBe("");
      expect(parsed.data.postingUrl).toBe("");
    }
  });

  it("rejects a missing organization", () => {
    const parsed = applicationInputSchema.safeParse({
      position: "Designer",
      organization: "",
      source: "jobBoard",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects a posting link without http", () => {
    const parsed = applicationInputSchema.safeParse({
      position: "Designer",
      organization: "Studio",
      source: "jobBoard",
      postingUrl: "example.com/job",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("applicationUpdateSchema", () => {
  it("accepts a status-only archive update", () => {
    const parsed = applicationUpdateSchema.safeParse({ status: "archived" });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual({ status: "archived" });
    }
  });
});

describe("applicationCommentSchema", () => {
  it("accepts a comment body", () => {
    expect(applicationCommentSchema.safeParse({ body: "Prep for the screen." }).success).toBe(true);
  });

  it("rejects a blank comment", () => {
    expect(applicationCommentSchema.safeParse({ body: "   " }).success).toBe(false);
  });
});
