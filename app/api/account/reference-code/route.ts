import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import { findRecruiterByReferenceCode } from "@/lib/auth-service";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { linkRecruiterSchema } from "@/lib/validators/auth";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "applicant") {
    return jsonError("Sign in as an applicant to link a recruiter.", 401);
  }

  const parsed = linkRecruiterSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  await dbConnect();
  const recruiter = await findRecruiterByReferenceCode(parsed.data.referenceCode);
  if (!recruiter) return jsonError("That recruiter code was not found.", 404);

  await User.updateOne({ _id: session.user.id }, { referenceCode: recruiter.referenceCode });

  return jsonOk({
    referenceCode: recruiter.referenceCode,
    recruiterName: recruiter.fullName,
  });
}
