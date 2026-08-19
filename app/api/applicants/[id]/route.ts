import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { loadApplicantForRecruiter } from "@/lib/application-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (session.user.role !== "recruiter") {
    return jsonError("Only recruiters can view linked applicants.", 403);
  }

  const { id } = await params;
  const loaded = await loadApplicantForRecruiter(id, session.user.referenceCode ?? "");
  if (!loaded) return jsonError("Applicant not found.", 404);

  return jsonOk({ applicant: loaded.applicant, applications: loaded.applications });
}
