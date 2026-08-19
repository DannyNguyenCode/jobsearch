import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FullScreenApplicationModal } from "@/components/applications/FullScreenApplicationModal";
import { loadApplicationForViewer } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Application details" };

export default async function ApplicationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("applicant");
  const { id } = await params;
  const loaded = await loadApplicationForViewer(id, {
    id: user.id,
    role: user.role,
    referenceCode: user.referenceCode ?? "",
  });
  if (!loaded) notFound();

  return (
    <FullScreenApplicationModal
      applicant={loaded.applicant}
      application={loaded.application}
      closeHref="/applicant/dashboard"
      mode="applicant"
    />
  );
}
