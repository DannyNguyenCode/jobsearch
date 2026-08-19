import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { canWriteApplications, WRITE_FORBIDDEN } from "@/lib/application-access";
import { loadApplicationForApplicant, removeApplicationFile } from "@/lib/application-service";
import { destroyApplicationAsset } from "@/lib/cloudinary";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (!canWriteApplications(session.user.role)) {
    return jsonError(WRITE_FORBIDDEN, 403);
  }

  const { id, docId } = await params;
  const loaded = await loadApplicationForApplicant(id, session.user.id);
  if (!loaded) return jsonError("Application not found.", 404);

  const removed = await removeApplicationFile(loaded.record, docId);
  if (!removed) return jsonError("Document not found.", 404);

  await destroyApplicationAsset(removed.publicId, removed.resourceType);
  return jsonOk({ application: removed.application });
}
