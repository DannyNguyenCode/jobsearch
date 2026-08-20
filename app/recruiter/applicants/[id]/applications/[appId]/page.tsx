import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FullScreenApplicationModal } from "@/components/applications/FullScreenApplicationModal";
import { loadApplicationForViewer } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Application details" };

export default async function RecruiterApplicationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string; appId: string }>;
}) {
  const user = await requireRole("recruiter");
  const { id, appId } = await params;
  const loaded = await loadApplicationForViewer(appId, {
    id: user.id,
    role: user.role,
    referenceCode: user.referenceCode ?? "",
  });
  if (!loaded || loaded.applicant.id !== id) notFound();

  return (
    <FullScreenApplicationModal
      applicant={loaded.applicant}
      application={loaded.application}
      closeHref={`/recruiter/applicants/${id}`}
      mode="recruiter"
    />
  );
}
