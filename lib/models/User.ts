import mongoose, { type HydratedDocument, type InferSchemaType, type Model } from "mongoose";
import type { UserRole } from "@/lib/types";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ["applicant", "recruiter"] },
    referenceCode: { type: String, trim: true, uppercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    openToRelocation: { type: Boolean, default: false },
    remotePreferred: { type: Boolean, default: false },
    emailVerified: { type: Date, default: null },
    verificationCodeHash: { type: String, select: false, default: null },
    verificationCodeExpires: { type: Date, select: false, default: null },
    resetCodeHash: { type: String, select: false, default: null },
    resetCodeExpires: { type: Date, select: false, default: null },
    lastLoggedIn: { type: Date, default: null },
  },
  {
    collection: "user",
    timestamps: { createdAt: "dateSignedUp", updatedAt: "updatedAt" },
  },
);

userSchema.index(
  { referenceCode: 1 },
  {
    unique: true,
    partialFilterExpression: { role: "recruiter", referenceCode: { $type: "string", $gt: "" } },
  },
);

userSchema.index({ role: 1, referenceCode: 1 });

export type UserFields = InferSchemaType<typeof userSchema> & {
  role: UserRole;
};

export type UserDocument = HydratedDocument<UserFields>;

const PROFILE_PATHS = ["phone", "location", "openToRelocation", "remotePreferred"] as const;

function userModel() {
  const existing = mongoose.models.User as Model<UserFields> | undefined;
  if (existing && PROFILE_PATHS.some((path) => !existing.schema.path(path))) {
    mongoose.deleteModel("User");
  }
  return (mongoose.models.User as Model<UserFields> | undefined) ?? mongoose.model<UserFields>("User", userSchema);
}

export const User: Model<UserFields> = userModel();
