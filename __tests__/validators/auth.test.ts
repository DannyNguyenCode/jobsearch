import { describe, expect, it } from "vitest";
import {
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verificationSchema,
} from "@/lib/validators/auth";

describe("registerSchema", () => {
  it("accepts an applicant payload", () => {
    const parsed = registerSchema.safeParse({
      fullName: "Danny Nguyen",
      email: " giabnguyen1@gmail.com ",
      password: "adminadmin",
      role: "applicant",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.email).toBe("giabnguyen1@gmail.com");
      expect(parsed.data.role).toBe("applicant");
    }
  });

  it("accepts a recruiter payload", () => {
    const parsed = registerSchema.safeParse({
      fullName: "Alex Rivers",
      email: "recruiter@example.com",
      password: "password1",
      role: "recruiter",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.role).toBe("recruiter");
  });

  it("rejects a short password", () => {
    const parsed = registerSchema.safeParse({
      fullName: "Danny Nguyen",
      email: "danny@example.com",
      password: "short",
      role: "applicant",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid role", () => {
    const parsed = registerSchema.safeParse({
      fullName: "Danny Nguyen",
      email: "danny@example.com",
      password: "adminadmin",
      role: "admin",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts credentials and a remember flag", () => {
    const parsed = loginSchema.safeParse({
      email: "danny@example.com",
      password: "adminadmin",
      remember: "true",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const parsed = loginSchema.safeParse({
      email: "danny@example.com",
      password: "",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("verificationSchema", () => {
  it("accepts a 6-digit code", () => {
    expect(verificationSchema.safeParse({ email: "a@b.com", code: "123456" }).success).toBe(true);
  });

  it("rejects a non-numeric code", () => {
    expect(verificationSchema.safeParse({ email: "a@b.com", code: "12ab56" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts email, code, and a new password", () => {
    const parsed = resetPasswordSchema.safeParse({
      email: "a@b.com",
      code: "654321",
      password: "newpassword",
    });
    expect(parsed.success).toBe(true);
  });
});

describe("emailSchema", () => {
  it("lowercases the email", () => {
    const parsed = emailSchema.safeParse({ email: "Danny@Example.COM" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.email).toBe("danny@example.com");
  });
});
