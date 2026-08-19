import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { canWriteApplications, WRITE_FORBIDDEN } from "@/lib/application-access";
import { attachApplicationFile, loadApplicationForApplicant } from "@/lib/application-service";
import { cloudinaryApplicationFolder } from "@/lib/cloudinary-folder";
import { destroyApplicationAsset, uploadApplicationAsset } from "@/lib/cloudinary";
import {
  cloudinaryPublicIdForKind,
  DOCUMENT_KIND_LABELS,
  isDocumentUploadKind,
} from "@/lib/document-kind";
import { documentLimitMessage, documentSizeLabel, isAllowedDocument } from "@/lib/files";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (!canWriteApplications(session.user.role)) {
    return jsonError(WRITE_FORBIDDEN, 403);
  }

  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  const file = form.get("file");
  if (!isDocumentUploadKind(kind)) {
    return jsonError("Choose a resume or job description.");
  }
  if (!(file instanceof File) || file.size === 0) {
    return jsonError(`Choose a ${DOCUMENT_KIND_LABELS[kind].toLowerCase()} file.`);
  }
  if (!isAllowedDocument(file)) {
    return jsonError(documentLimitMessage());
  }

  const { id } = await params;
  const loaded = await loadApplicationForApplicant(id, session.user.id);
  if (!loaded) return jsonError("Application not found.", 404);

  const personName = loaded.applicant.name || session.user.fullName || "unknown";
  const folder = cloudinaryApplicationFolder(personName, loaded.record.position, loaded.record.dateApplied);
  const previous = loaded.record.documents.find((item) => item.kind === kind);

  let uploaded: Awaited<ReturnType<typeof uploadApplicationAsset>>;
  try {
    uploaded = await uploadApplicationAsset({
      buffer: Buffer.from(await file.arrayBuffer()),
      folder,
      publicId: cloudinaryPublicIdForKind(kind),
      filename: file.name,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("not configured")) {
      return jsonError("File uploads are not configured yet.", 503);
    }
    return jsonError("Could not upload the file. Try again.", 502);
  }

  const application = await attachApplicationFile(loaded.record, {
    kind,
    name: file.name,
    sizeLabel: documentSizeLabel(uploaded.bytes),
    url: uploaded.secure_url,
    publicId: uploaded.public_id,
    resourceType: uploaded.resource_type,
  });

  if (previous?.publicId && previous.publicId !== uploaded.public_id) {
    await destroyApplicationAsset(previous.publicId, previous.resourceType || "raw");
  }

  return jsonOk({ application }, 201);
}
