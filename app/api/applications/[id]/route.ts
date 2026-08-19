import { auth } from "@/auth";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { canReadApplications, canWriteApplications, WRITE_FORBIDDEN } from "@/lib/application-access";
import {
  deleteApplication,
  loadApplicationForApplicant,
  loadApplicationForViewer,
  updateApplication,
} from "@/lib/application-service";
import { destroyApplicationAsset } from "@/lib/cloudinary";
import { applicationUpdateSchema } from "@/lib/validators/application";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (!canReadApplications(session.user.role)) {
    return jsonError("You do not have access to applications.", 403);
  }

  const { id } = await params;
  const loaded = await loadApplicationForViewer(id, {
    id: session.user.id,
    role: session.user.role,
    referenceCode: session.user.referenceCode ?? "",
  });
  if (!loaded) return jsonError("Application not found.", 404);

  return jsonOk({ application: loaded.application, applicant: loaded.applicant });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (!canWriteApplications(session.user.role)) {
    return jsonError(WRITE_FORBIDDEN, 403);
  }

  const parsed = applicationUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  const { id } = await params;
  const loaded = await loadApplicationForApplicant(id, session.user.id);
  if (!loaded) return jsonError("Application not found.", 404);

  const application = await updateApplication(loaded.record, parsed.data);
  return jsonOk({ application });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return jsonError("Sign in to continue.", 401);
  if (!canWriteApplications(session.user.role)) {
    return jsonError(WRITE_FORBIDDEN, 403);
  }

  const { id } = await params;
  const loaded = await loadApplicationForApplicant(id, session.user.id);
  if (!loaded) return jsonError("Application not found.", 404);

  for (const document of loaded.record.documents ?? []) {
    if (document.publicId) {
      await destroyApplicationAsset(document.publicId, document.resourceType || "raw");
    }
  }

  await deleteApplication(loaded.record);
  return jsonOk({ deleted: true });
}
