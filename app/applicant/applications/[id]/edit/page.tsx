import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ApplicationForm } from "@/components/applications/ApplicationForm";
import { loadApplicationForViewer } from "@/lib/application-service";
import { requireRole } from "@/lib/require-role";

export const metadata: Metadata = { title: "Edit application" };

export default async function EditApplicationPage({
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
  return <ApplicationForm application={loaded.application} cancelHref={`/applicant/applications/${id}`} />;
}
