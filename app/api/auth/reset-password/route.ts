import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import { hashPassword, isCodeValid } from "@/lib/auth-service";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validators/auth";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  await dbConnect();
  const user = await User.findOne({ email: parsed.data.email }).select(
    "+password +resetCodeHash +resetCodeExpires",
  );

  if (!user || !isCodeValid(parsed.data.code, user.resetCodeHash, user.resetCodeExpires)) {
    return jsonError("Invalid or expired reset code.");
  }

  user.password = await hashPassword(parsed.data.password);
  user.set("resetCodeHash", undefined);
  user.set("resetCodeExpires", undefined);
  await user.save();

  return jsonOk({ reset: true });
}
