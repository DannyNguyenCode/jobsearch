import mongoose, { type HydratedDocument, type InferSchemaType, type Model } from "mongoose";
import type { UserRole } from "@/lib/types";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: ["applicant", "recruiter"] },
    referenceCode: { type: String, trim: true, uppercase: true, default: "" },
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

export const User: Model<UserFields> =
  mongoose.models.User ?? mongoose.model<UserFields>("User", userSchema);
