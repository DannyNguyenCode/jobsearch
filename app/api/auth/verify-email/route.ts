import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import { isCodeValid } from "@/lib/auth-service";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { verificationSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = verificationSchema.safeParse(body);
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email }).select(
    "+verificationCodeHash +verificationCodeExpires",
  );

  if (!user) return jsonError("Invalid or expired verification code.");
  if (user.emailVerified) return jsonOk({ alreadyVerified: true });

  if (!isCodeValid(parsed.data.code, user.verificationCodeHash, user.verificationCodeExpires)) {
    return jsonError("Invalid or expired verification code.");
  }

  user.emailVerified = new Date();
  user.set("verificationCodeHash", undefined);
  user.set("verificationCodeExpires", undefined);
  await user.save();

  return jsonOk({ verified: true });
}
