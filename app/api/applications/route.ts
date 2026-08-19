import { auth } from "@/auth";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { canReadApplications, canWriteApplications, WRITE_FORBIDDEN } from "@/lib/application-access";
import {
  createApplication,
  listApplicationsForApplicant,
  listApplicationsForRecruiter,
} from "@/lib/application-service";
import { applicationInputSchema } from "@/lib/validators/application";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (!canReadApplications(session.user.role)) {
    return jsonError("You do not have access to applications.", 403);
  }

  const view = new URL(request.url).searchParams.get("view") === "archive" ? "archive" : "active";
  const applications =
    session.user.role === "recruiter"
      ? await listApplicationsForRecruiter(session.user.referenceCode ?? "", view)
      : await listApplicationsForApplicant(session.user.id, view);

  return jsonOk({ applications });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (!canWriteApplications(session.user.role)) {
    return jsonError(WRITE_FORBIDDEN, 403);
  }

  const parsed = applicationInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  const application = await createApplication(session.user.id, parsed.data);
  return jsonOk({ application }, 201);
}
