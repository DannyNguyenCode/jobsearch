import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import { assignVerificationCode } from "@/lib/auth-service";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { emailSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = emailSchema.safeParse(body);
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email }).select(
    "+verificationCodeHash +verificationCodeExpires",
  );

  if (!user) {
    return jsonOk({ sent: true });
  }
  if (user.emailVerified) {
    return jsonError("This email is already verified. You can sign in.", 409);
  }

  try {
    await assignVerificationCode(user);
  } catch (error) {
    console.error("Failed to resend verification email", error);
    return jsonError(
      error instanceof Error
        ? error.message
        : "Could not send the verification email. Try again shortly.",
      502,
    );
  }

  return jsonOk({ sent: true });
}
