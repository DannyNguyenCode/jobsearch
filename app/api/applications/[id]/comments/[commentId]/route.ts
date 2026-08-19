import { auth } from "@/auth";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { canReadApplications } from "@/lib/application-access";
import {
  loadApplicationForViewer,
  removeApplicationComment,
  updateApplicationComment,
} from "@/lib/application-service";
import { applicationCommentSchema } from "@/lib/validators/application";

const OWN_COMMENT_ONLY = "You can only update or delete your own comments.";

async function loadOwnedCommentContext(id: string) {
  const session = await auth();
  if (!session?.user) return { error: jsonError("Sign in to continue.", 401) };
  if (!canReadApplications(session.user.role)) {
    return { error: jsonError("You do not have access to applications.", 403) };
  }

  const loaded = await loadApplicationForViewer(id, {
    id: session.user.id,
    role: session.user.role,
    referenceCode: session.user.referenceCode ?? "",
  });
  if (!loaded) return { error: jsonError("Application not found.", 404) };

  return { session, loaded };
}

function mutationResponse(result: { error?: "not_found" | "forbidden"; application?: unknown }) {
  if (result.error === "not_found") return jsonError("Comment not found.", 404);
  if (result.error === "forbidden") return jsonError(OWN_COMMENT_ONLY, 403);
  return jsonOk({ application: result.application });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { id, commentId } = await params;
  const context = await loadOwnedCommentContext(id);
  if ("error" in context) return context.error;

  const parsed = applicationCommentSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  const result = await updateApplicationComment(
    context.loaded.record,
    commentId,
    context.session.user.id,
    parsed.data.body,
  );
  return mutationResponse(result);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { id, commentId } = await params;
  const context = await loadOwnedCommentContext(id);
  if ("error" in context) return context.error;

  const result = await removeApplicationComment(context.loaded.record, commentId, context.session.user.id);
  return mutationResponse(result);
}
