import { z } from "zod";

export const roles = ["applicant", "recruiter"] as const;

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email"));

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(roles),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required").max(72),
  remember: z.string().optional(),
});

export const emailSchema = z.object({
  email: emailField,
});

export const verificationSchema = z.object({
  email: emailField,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const resetPasswordSchema = z.object({
  email: emailField,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const linkRecruiterSchema = z.object({
  referenceCode: z
    .string()
    .trim()
    .regex(/^REC-[A-Z0-9]{6}$/i, "Enter a recruiter code like REC-7K4P2M"),
});

export const applicantProfileSchema = z.object({
  preferredName: z.string().trim().max(40, "Enter a shorter preferred name"),
  phone: z.string().trim().max(40, "Enter a shorter phone number"),
  location: z.string().trim().max(80, "Enter a shorter location"),
  openToRelocation: z.boolean(),
  remotePreferred: z.boolean(),
});
