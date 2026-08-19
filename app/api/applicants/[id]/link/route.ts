import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { unlinkApplicantFromRecruiter } from "@/lib/application-service";
import { sendRecruiterUnlinkedEmail } from "@/lib/email";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (session.user.role !== "recruiter") {
    return jsonError("Only recruiters can end a linked relationship.", 403);
  }

  const { id } = await params;
  const unlinked = await unlinkApplicantFromRecruiter(id, session.user.referenceCode ?? "");
  if (!unlinked) return jsonError("Applicant not found.", 404);

  let emailSent = false;
  try {
    await sendRecruiterUnlinkedEmail(
      unlinked.email,
      unlinked.name,
      session.user.fullName || session.user.name || "Your recruiter",
    );
    emailSent = true;
  } catch {
    emailSent = false;
  }

  return jsonOk({
    unlinked: true,
    emailSent,
    applicant: { id: unlinked.id, name: unlinked.name },
  });
}
