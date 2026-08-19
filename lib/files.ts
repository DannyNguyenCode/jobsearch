const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "png", "jpg", "jpeg", "webp", "txt"]);

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
  "text/plain",
]);

export function fileExtension(name: string) {
  const parts = name.trim().toLowerCase().split(".");
  return parts.length > 1 ? parts.at(-1) ?? "" : "";
}

export function isAllowedDocument(file: { name: string; type: string; size: number }) {
  if (file.size <= 0 || file.size > MAX_BYTES) return false;
  const extension = fileExtension(file.name);
  if (ALLOWED_EXTENSIONS.has(extension)) return true;
  return ALLOWED_TYPES.has(file.type);
}

export function documentSizeLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function documentLimitMessage() {
  return "Use a PDF, DOCX, or image up to 10MB.";
}

export { MAX_BYTES };
