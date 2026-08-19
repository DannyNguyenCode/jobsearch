import { z } from "zod";
import { APPLICATION_SOURCES } from "@/lib/application-source";

const applicationStatuses = [
  "planning",
  "applied",
  "screening",
  "assessment",
  "interview",
  "offer",
  "rejected",
  "archived",
  "withdrawn",
] as const;

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => value === "" || /^https?:\/\//i.test(value), "Enter a valid posting link");

const optionalEmail = z
  .string()
  .trim()
  .max(120)
  .refine((value) => value === "" || z.email().safeParse(value).success, "Enter a valid contact email");

export const applicationInputSchema = z.object({
  position: z.string().trim().min(2, "Enter the position").max(120),
  organization: z.string().trim().min(2, "Organization name is required").max(120),
  location: z.string().trim().max(160).optional().default(""),
  postingUrl: optionalUrl.optional().default(""),
  source: z.enum(APPLICATION_SOURCES),
  contactName: z.string().trim().max(80).optional().default(""),
  contactEmail: optionalEmail.optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  notes: z.string().trim().max(4000).optional().default(""),
  dateApplied: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the date applied")
    .optional(),
  status: z.enum(applicationStatuses).optional().default("applied"),
});

export const applicationUpdateSchema = z.object({
  position: z.string().trim().min(2, "Enter the position").max(120).optional(),
  organization: z.string().trim().min(2, "Organization name is required").max(120).optional(),
  location: z.string().trim().max(160).optional(),
  postingUrl: optionalUrl.optional(),
  source: z.enum(APPLICATION_SOURCES).optional(),
  contactName: z.string().trim().max(80).optional(),
  contactEmail: optionalEmail.optional(),
  phone: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(4000).optional(),
  dateApplied: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the date applied")
    .optional(),
  status: z.enum(applicationStatuses).optional(),
});

export const applicationCommentSchema = z.object({
  body: z.string().trim().min(1, "Enter a comment").max(4000),
});

export type ApplicationInput = z.infer<typeof applicationInputSchema>;
export type ApplicationUpdate = z.infer<typeof applicationUpdateSchema>;
export type ApplicationCommentInput = z.infer<typeof applicationCommentSchema>;
