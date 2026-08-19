import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { sendPasswordResetCodeEmail, sendVerificationCodeEmail } from "@/lib/email";
import { User, type UserDocument } from "@/lib/models/User";
import { generateRecruiterReferenceCode, normalizeReferenceCode } from "@/lib/reference-code";
import { newEmailCode } from "@/lib/security";

export { isCodeValid, newEmailCode } from "@/lib/security";

const PASSWORD_ROUNDS = 12;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_ROUNDS);
}

export async function allocateRecruiterReferenceCode() {
  await dbConnect();
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generateRecruiterReferenceCode();
    const taken = await User.exists({ role: "recruiter", referenceCode: code });
    if (!taken) return code;
  }
  throw new Error("Could not generate a unique recruiter code");
}

export async function findRecruiterByReferenceCode(code: string) {
  await dbConnect();
  return User.findOne({
    role: "recruiter",
    referenceCode: normalizeReferenceCode(code),
  });
}

export async function assignVerificationCode(user: UserDocument) {
  const issued = newEmailCode();
  user.verificationCodeHash = issued.hash;
  user.verificationCodeExpires = issued.expires;
  await user.save();
  await sendVerificationCodeEmail(user.email, issued.code);
}

export async function assignPasswordResetCode(user: UserDocument) {
  const issued = newEmailCode();
  user.resetCodeHash = issued.hash;
  user.resetCodeExpires = issued.expires;
  await user.save();
  await sendPasswordResetCodeEmail(user.email, issued.code);
}

export function isDuplicateKeyError(error: unknown, field?: string) {
  if (!error || typeof error !== "object" || !("code" in error) || error.code !== 11000) {
    return false;
  }
  if (!field) return true;
  const keyPattern = "keyPattern" in error ? error.keyPattern : null;
  if (keyPattern && typeof keyPattern === "object") {
    return field in keyPattern;
  }
  return true;
}
