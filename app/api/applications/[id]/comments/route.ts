import { auth } from "@/auth";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { canReadApplications } from "@/lib/application-access";
import { addApplicationComment, loadApplicationForViewer } from "@/lib/application-service";
import { applicationCommentSchema } from "@/lib/validators/application";

async function viewerFromSession() {
  const session = await auth();
  if (!session?.user) return { error: jsonError("Sign in to continue.", 401) };
  if (!canReadApplications(session.user.role)) {
    return { error: jsonError("You do not have access to applications.", 403) };
  }
  return { session };
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const loadedSession = await viewerFromSession();
  if ("error" in loadedSession) return loadedSession.error;
  const session = loadedSession.session;

  const { id } = await params;
  const loaded = await loadApplicationForViewer(id, {
    id: session.user.id,
    role: session.user.role,
    referenceCode: session.user.referenceCode ?? "",
  });
  if (!loaded) return jsonError("Application not found.", 404);

  return jsonOk({ comments: loaded.application.comments });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const loadedSession = await viewerFromSession();
  if ("error" in loadedSession) return loadedSession.error;
  const session = loadedSession.session;

  const parsed = applicationCommentSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  const { id } = await params;
  const loaded = await loadApplicationForViewer(id, {
    id: session.user.id,
    role: session.user.role,
    referenceCode: session.user.referenceCode ?? "",
  });
  if (!loaded) return jsonError("Application not found.", 404);

  const application = await addApplicationComment(
    loaded.record,
    {
      id: session.user.id,
      fullName: session.user.fullName || session.user.name || "User",
      role: session.user.role,
    },
    parsed.data.body,
  );

  return jsonOk({ application }, 201);
}
