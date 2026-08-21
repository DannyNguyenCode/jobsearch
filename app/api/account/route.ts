import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { deleteApplicantAccount, deleteRecruiterAccount } from "@/lib/account-service";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to continue.", 401);

  const deleted =
    session.user.role === "applicant"
      ? await deleteApplicantAccount(session.user.id)
      : session.user.role === "recruiter"
        ? await deleteRecruiterAccount(session.user.id)
        : null;

  if (!deleted) return jsonError("Account not found.", 404);

  return jsonOk({ deleted: true });
}
