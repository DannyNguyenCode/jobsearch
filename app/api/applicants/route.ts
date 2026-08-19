import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { listLinkedApplicants } from "@/lib/application-service";

export async function GET() {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (session.user.role !== "recruiter") {
    return jsonError("Only recruiters can view linked applicants.", 403);
  }

  const applicants = await listLinkedApplicants(session.user.referenceCode ?? "");
  return jsonOk({ applicants });
}
