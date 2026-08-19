export const DOCUMENT_UPLOAD_KINDS = ["resume", "jobPosting"] as const;

export type DocumentUploadKind = (typeof DOCUMENT_UPLOAD_KINDS)[number];

export const DOCUMENT_KIND_LABELS: Record<DocumentUploadKind, string> = {
  resume: "Resume",
  jobPosting: "Job description",
};

export function isDocumentUploadKind(value: string): value is DocumentUploadKind {
  return DOCUMENT_UPLOAD_KINDS.includes(value as DocumentUploadKind);
}

export function cloudinaryPublicIdForKind(kind: DocumentUploadKind) {
  return kind === "resume" ? "resume" : "job-description";
}
