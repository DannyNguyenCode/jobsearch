import mongoose, { type HydratedDocument, type InferSchemaType, type Model } from "mongoose";
import { z } from "zod";
import { APPLICATION_ID_PATTERN, generateApplicationId } from "@/lib/application-id";
import {
  DEFAULT_JOB_APPLICATION_STATUS,
  JOB_APPLICATION_STATUSES,
  type JobApplicationStatus,
} from "@/lib/job-application-status";
import { JOB_APPLICATION_SOURCES, type JobApplicationSource } from "@/lib/job-application-source";
import { WORK_ARRANGEMENTS, type WorkArrangement } from "@/lib/work-arrangement";

const APPLICATION_ID_MAX_ATTEMPTS = 8;

export type CloudinaryDocumentMeta = {
  url: string;
  publicId: string;
  originalFilename: string;
};

function blankToUndefined(value: string | undefined | null) {
  if (value == null) return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isEmail(value: string) {
  return z.email().safeParse(value).success;
}

export function isDuplicateApplicationIdError(error: unknown) {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  const candidate = error as { code?: number; keyPattern?: Record<string, unknown>; message?: string };
  if (candidate.code !== 11000) return false;
  if (candidate.keyPattern && "applicationId" in candidate.keyPattern) return true;
  return typeof candidate.message === "string" && candidate.message.includes("applicationId");
}

const httpUrlValidator = {
  validator(value: string) {
    return isHttpUrl(value);
  },
  message: "Must be a valid HTTP or HTTPS URL",
};

const cloudinaryDocumentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
      validate: httpUrlValidator,
    },
    publicId: { type: String, required: true, trim: true, minlength: 1, maxlength: 512 },
    originalFilename: { type: String, required: true, trim: true, minlength: 1, maxlength: 255 },
  },
  { _id: false },
);

const jobApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
      trim: true,
      uppercase: true,
      match: [APPLICATION_ID_PATTERN, "applicationId must look like APP-K8F4P2"],
    },
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employer: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    jobTitle: { type: String, required: true, trim: true, minlength: 1, maxlength: 200 },
    dateApplied: {
      type: Date,
      required: function isDateAppliedRequired(this: { status?: JobApplicationStatus }) {
        return this.status !== "PLANNING_TO_APPLY";
      },
    },
    location: { type: String, trim: true, maxlength: 200, set: blankToUndefined },
    workArrangement: {
      type: String,
      enum: WORK_ARRANGEMENTS,
      set: blankToUndefined,
    },
    source: {
      type: String,
      enum: JOB_APPLICATION_SOURCES,
      set: blankToUndefined,
    },
    jobPostingUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      set: blankToUndefined,
      validate: {
        validator(value: string) {
          return isHttpUrl(value);
        },
        message: "Job posting URL must be a valid HTTP or HTTPS URL",
      },
    },
    contactName: { type: String, trim: true, maxlength: 120, set: blankToUndefined },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      set: blankToUndefined,
      validate: {
        validator(value: string) {
          return isEmail(value);
        },
        message: "Contact email must be a valid email address",
      },
    },
    contactPhone: { type: String, trim: true, maxlength: 64, set: blankToUndefined },
    status: {
      type: String,
      required: true,
      enum: JOB_APPLICATION_STATUSES,
      default: DEFAULT_JOB_APPLICATION_STATUS,
    },
    applicantNotes: { type: String, trim: true, maxlength: 4000, set: blankToUndefined },
    resume: { type: cloudinaryDocumentSchema, default: undefined },
    coverLetter: { type: cloudinaryDocumentSchema, default: undefined },
    jobDescription: { type: cloudinaryDocumentSchema, default: undefined },
    archivedAt: { type: Date, default: null },
  },
  {
    collection: "jobapplication",
    timestamps: true,
    strict: true,
  },
);

jobApplicationSchema.index({ applicantId: 1, archivedAt: 1, dateApplied: -1 });
jobApplicationSchema.index({ applicantId: 1, status: 1 });

jobApplicationSchema.pre("validate", function assignApplicationId() {
  if (!this.applicationId) {
    this.applicationId = generateApplicationId();
  }
  if (this.isNew) {
    this.set("createdAt", undefined);
    this.set("updatedAt", undefined);
  }
});

export type JobApplicationFields = InferSchemaType<typeof jobApplicationSchema> & {
  applicationId: string;
  status: JobApplicationStatus;
  workArrangement?: WorkArrangement;
  source?: JobApplicationSource;
  resume?: CloudinaryDocumentMeta;
  coverLetter?: CloudinaryDocumentMeta;
  jobDescription?: CloudinaryDocumentMeta;
  archivedAt: Date | null;
};

export type JobApplicationDocument = HydratedDocument<JobApplicationFields> & {
  initializeTimestamps: () => JobApplicationDocument;
};

export type JobApplicationCreateInput = {
  applicantId: mongoose.Types.ObjectId | string;
  employer: string;
  jobTitle: string;
  dateApplied?: Date;
  location?: string;
  workArrangement?: WorkArrangement;
  source?: JobApplicationSource;
  jobPostingUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status?: JobApplicationStatus;
  applicantNotes?: string;
  resume?: CloudinaryDocumentMeta;
  coverLetter?: CloudinaryDocumentMeta;
  jobDescription?: CloudinaryDocumentMeta;
  archivedAt?: Date | null;
};

export const JobApplication: Model<JobApplicationFields> =
  mongoose.models.JobApplication ??
  mongoose.model<JobApplicationFields>("JobApplication", jobApplicationSchema);

export async function createJobApplicationRecord(fields: JobApplicationCreateInput) {
  let lastError: unknown;
  for (let attempt = 0; attempt < APPLICATION_ID_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await JobApplication.create(fields);
    } catch (error) {
      lastError = error;
      if (!isDuplicateApplicationIdError(error)) {
        throw error;
      }
    }
  }
  throw lastError;
}
