import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import { assignPasswordResetCode } from "@/lib/auth-service";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { emailSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = emailSchema.safeParse(body);
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email }).select("+resetCodeHash +resetCodeExpires");

  if (user) {
    try {
      await assignPasswordResetCode(user, parsed.data.email);
    } catch (error) {
      console.error("Failed to send password reset email", error);
      return jsonError("Could not send the reset email. Try again shortly.", 502);
    }
  }

  return jsonOk({ sent: true });
}
