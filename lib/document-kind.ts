export const DOCUMENT_UPLOAD_KINDS = ["resume", "coverLetter", "jobPosting"] as const;

export type DocumentUploadKind = (typeof DOCUMENT_UPLOAD_KINDS)[number];

export const DOCUMENT_KIND_LABELS: Record<DocumentUploadKind, string> = {
  resume: "Resume",
  coverLetter: "Cover letter",
  jobPosting: "Job description",
};

const CLOUDINARY_PUBLIC_IDS: Record<DocumentUploadKind, string> = {
  resume: "resume",
  coverLetter: "cover-letter",
  jobPosting: "job-description",
};

export function isDocumentUploadKind(value: string): value is DocumentUploadKind {
  return DOCUMENT_UPLOAD_KINDS.includes(value as DocumentUploadKind);
}

export function cloudinaryPublicIdForKind(kind: DocumentUploadKind) {
  return CLOUDINARY_PUBLIC_IDS[kind];
}
