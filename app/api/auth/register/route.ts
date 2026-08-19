import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import {
  allocateRecruiterReferenceCode,
  assignVerificationCode,
  hashPassword,
  isDuplicateKeyError,
} from "@/lib/auth-service";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { normalizeReferenceCode } from "@/lib/reference-code";
import { registerSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  const { fullName, email, password, role } = parsed.data;

  try {
    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) {
      return jsonError("An account with this email already exists.", 409);
    }

    let referenceCode = "";
    if (role === "recruiter") {
      referenceCode = await allocateRecruiterReferenceCode();
    }

    const user = await User.create({
      fullName,
      email,
      password: await hashPassword(password),
      role,
      referenceCode: referenceCode ? normalizeReferenceCode(referenceCode) : "",
    });

    try {
      await assignVerificationCode(user);
    } catch (error) {
      console.error("Failed to send verification email", error);
      return jsonOk(
        {
          email: user.email,
          emailSent: false,
          message: "Account created, but the verification email could not be sent. Use resend on the next page.",
        },
        201,
      );
    }

    return jsonOk({ email: user.email, emailSent: true }, 201);
  } catch (error) {
    if (isDuplicateKeyError(error, "email")) {
      return jsonError("An account with this email already exists.", 409);
    }
    console.error("Register failed", error);
    return NextResponse.json({ error: "Could not create the account." }, { status: 500 });
  }
}
