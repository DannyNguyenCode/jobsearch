import mongoose, { type HydratedDocument, type InferSchemaType, type Model } from "mongoose";
import type { ApplicationSource, ApplicationStatus, DocumentKind } from "@/lib/types";

const documentSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, enum: ["resume", "coverLetter", "jobPosting", "other"] },
    name: { type: String, required: true, trim: true },
    sizeLabel: { type: String, default: "", trim: true },
    uploadedAt: { type: Date, default: Date.now },
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
    resourceType: { type: String, default: "raw" },
  },
  { _id: true },
);

const commentSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    author: { type: String, required: true, trim: true },
    authorInitials: { type: String, default: "", trim: true },
    authorRole: { type: String, enum: ["applicant", "recruiter"], default: "recruiter" },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const timelineEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    timestamp: { type: Date, default: Date.now },
    icon: { type: String, default: "history" },
    tone: { type: String, enum: ["primary", "secondary", "neutral", "success"], default: "neutral" },
    status: {
      type: String,
      enum: [
        "planning",
        "applied",
        "screening",
        "assessment",
        "interview",
        "offer",
        "rejected",
        "archived",
        "withdrawn",
      ],
    },
  },
  { _id: true },
);

const applicationSchema = new mongoose.Schema(
  {
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    position: { type: String, required: true, trim: true, maxlength: 120 },
    organization: { type: String, required: true, trim: true, maxlength: 120 },
    location: { type: String, default: "", trim: true, maxlength: 160 },
    postingUrl: { type: String, default: "", trim: true, maxlength: 2048 },
    source: {
      type: String,
      required: true,
      enum: ["jobBoard", "companySite", "recruiter", "referral", "other"],
      default: "jobBoard",
    },
    contactName: { type: String, default: "", trim: true, maxlength: 80 },
    contactEmail: { type: String, default: "", trim: true, lowercase: true, maxlength: 120 },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    notes: { type: String, default: "", trim: true, maxlength: 4000 },
    dateApplied: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        "planning",
        "applied",
        "screening",
        "assessment",
        "interview",
        "offer",
        "rejected",
        "archived",
        "withdrawn",
      ],
      default: "applied",
      index: true,
    },
    documents: { type: [documentSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    timeline: { type: [timelineEventSchema], default: [] },
  },
  {
    collection: "application",
    timestamps: true,
  },
);

applicationSchema.index({ applicantId: 1, dateApplied: -1 });
applicationSchema.index({ applicantId: 1, status: 1 });

export type ApplicationFields = InferSchemaType<typeof applicationSchema> & {
  source: ApplicationSource;
  status: ApplicationStatus;
  documents: Array<InferSchemaType<typeof documentSchema> & { kind: DocumentKind }>;
};

export type ApplicationDocument = HydratedDocument<ApplicationFields>;

export const Application: Model<ApplicationFields> =
  mongoose.models.Application ?? mongoose.model<ApplicationFields>("Application", applicationSchema);
