import type { ApplicationDocument } from "@/lib/types";
import type { DocumentUploadKind } from "@/lib/document-kind";

type DocumentResponse = {
  error?: string;
  application?: { documents?: ApplicationDocument[] };
};

async function readDocumentResponse(response: Response) {
  const result = (await response.json()) as DocumentResponse;
  if (!response.ok) {
    throw new Error(result.error ?? "Could not update the document.");
  }
  return result.application;
}

export async function postApplicationDocument(
  applicationId: string,
  kind: DocumentUploadKind,
  file: File,
) {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file);
  const response = await fetch(`/api/applications/${applicationId}/documents`, {
    method: "POST",
    body: form,
  });
  return readDocumentResponse(response);
}

export async function deleteApplicationDocument(applicationId: string, documentId: string) {
  const response = await fetch(`/api/applications/${applicationId}/documents/${documentId}`, {
    method: "DELETE",
  });
  return readDocumentResponse(response);
}
