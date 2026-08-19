"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import {
  DOCUMENT_KIND_LABELS,
  DOCUMENT_UPLOAD_KINDS,
  type DocumentUploadKind,
} from "@/lib/document-kind";
import { deleteApplicationDocument, postApplicationDocument } from "@/lib/document-upload";
import { documentLimitMessage, isAllowedDocument } from "@/lib/files";
import type { ApplicationDocument } from "@/lib/types";

const KIND_ICON: Record<DocumentUploadKind, string> = {
  resume: "description",
  jobPosting: "bookmark_added",
};

const ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.txt";

type DocumentPanelProps = {
  documents: ApplicationDocument[];
  applicationId?: string;
  pending?: Partial<Record<DocumentUploadKind, File>>;
  onPendingChange?: (kind: DocumentUploadKind, file: File | null) => void;
  title?: string;
  compact?: boolean;
};

export function DocumentPanel({
  documents,
  applicationId,
  pending,
  onPendingChange,
  title = "Documents",
  compact = false,
}: DocumentPanelProps) {
  const router = useRouter();
  const [items, setItems] = useState(documents);
  const [busyKind, setBusyKind] = useState<DocumentUploadKind | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setItems(documents);
  }, [documents]);

  async function handleSelected(kind: DocumentUploadKind, file: File | undefined) {
    if (!file) return;
    setError("");
    if (!isAllowedDocument(file)) {
      setError(documentLimitMessage());
      return;
    }
    if (!applicationId) {
      onPendingChange?.(kind, file);
      return;
    }
    setBusyKind(kind);
    try {
      const application = await postApplicationDocument(applicationId, kind, file);
      if (application?.documents) setItems(application.documents);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not upload the file.");
    } finally {
      setBusyKind(null);
    }
  }

  async function handleRemove(document: ApplicationDocument) {
    if (!applicationId) {
      if (document.kind === "resume" || document.kind === "jobPosting") {
        onPendingChange?.(document.kind, null);
      }
      setItems((current) => current.filter((item) => item.id !== document.id));
      return;
    }
    setError("");
    setBusyKind(document.kind === "jobPosting" ? "jobPosting" : "resume");
    try {
      const application = await deleteApplicationDocument(applicationId, document.id);
      if (application?.documents) setItems(application.documents);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove the file.");
    } finally {
      setBusyKind(null);
    }
  }

  if (compact) {
    return (
      <section>
        <h2 className="font-semibold mb-3">{title}</h2>
        <DocumentList compact documents={items} />
      </section>
    );
  }

  return (
    <section className="card-surface p-6">
      <h2 className="font-semibold flex items-center gap-2 pb-3 mb-4 border-b border-base-300">
        <Icon className="text-primary" name="folder_open" size={20} />
        {title}
      </h2>
      <p className="text-sm text-muted mb-4">
        Upload a resume and the job description. Files are stored under the jobtrackerhub folder.
      </p>
      <div className="space-y-3">
        {DOCUMENT_UPLOAD_KINDS.map((kind) => {
          const stored = items.find((item) => item.kind === kind);
          const pendingFile = pending?.[kind];
          return (
            <DocumentSlot
              busy={busyKind === kind}
              key={kind}
              kind={kind}
              pendingName={pendingFile?.name}
              stored={stored}
              onRemove={stored || pendingFile ? () => void handleRemove(stored ?? pendingDocument(kind, pendingFile!)) : undefined}
              onSelect={(file) => void handleSelected(kind, file)}
            />
          );
        })}
      </div>
      {error ? <p className="text-error text-xs mt-3">{error}</p> : null}
    </section>
  );
}

function pendingDocument(kind: DocumentUploadKind, file: File): ApplicationDocument {
  return {
    id: `pending-${kind}`,
    kind,
    name: file.name,
    sizeLabel: "",
    uploadedAt: "",
  };
}

function DocumentSlot({
  kind,
  stored,
  pendingName,
  busy,
  onSelect,
  onRemove,
}: {
  kind: DocumentUploadKind;
  stored?: ApplicationDocument;
  pendingName?: string;
  busy: boolean;
  onSelect: (file: File | undefined) => void;
  onRemove?: () => void;
}) {
  const inputId = useId();
  const label = DOCUMENT_KIND_LABELS[kind];
  const currentName = stored?.name ?? pendingName;

  return (
    <div className="border border-outline-variant rounded-md p-3 bg-canvas">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <Icon className="text-secondary mt-0.5" name={KIND_ICON[kind]} />
          <div className="min-w-0">
            <p className="text-sm font-medium">{label}</p>
            {currentName ? (
              <p className="text-xs text-muted truncate">
                {currentName}
                {stored?.sizeLabel ? ` · ${stored.sizeLabel}` : ""}
                {stored?.uploadedAt ? ` · ${stored.uploadedAt}` : pendingName ? " · Uploads when you save" : ""}
              </p>
            ) : (
              <p className="text-xs text-muted">PDF, DOCX, or image up to 10MB</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {stored?.url ? (
            <a
              aria-label={`Download ${stored.name}`}
              className="btn btn-ghost btn-xs btn-circle"
              href={stored.url}
              rel="noreferrer"
              target="_blank"
            >
              <Icon name="download" size={16} />
            </a>
          ) : null}
          <label className="btn btn-ghost btn-xs btn-circle" htmlFor={inputId}>
            <span className="sr-only">{currentName ? `Replace ${label}` : `Upload ${label}`}</span>
            {busy ? <span className="loading loading-spinner loading-xs" /> : <Icon name={currentName ? "sync" : "upload_file"} size={16} />}
          </label>
          <input
            accept={ACCEPT}
            className="hidden"
            disabled={busy}
            id={inputId}
            type="file"
            onChange={(event) => {
              onSelect(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          {onRemove ? (
            <button
              aria-label={`Remove ${label}`}
              className="btn btn-ghost btn-xs btn-circle"
              disabled={busy}
              type="button"
              onClick={onRemove}
            >
              <Icon name="delete" size={16} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DocumentList({
  documents,
  compact,
}: {
  documents: ApplicationDocument[];
  compact?: boolean;
}) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted">No documents uploaded yet.</p>;
  }

  return (
    <ul className={compact ? "space-y-2" : "mt-4 space-y-2"}>
      {documents.map((document) => (
        <li className="border border-outline-variant rounded-md p-3 bg-canvas" key={document.id}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <Icon
                className="text-secondary mt-0.5"
                name={document.kind === "resume" ? "description" : "bookmark_added"}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{document.name}</p>
                <p className="text-xs text-muted">
                  {document.sizeLabel}
                  {document.uploadedAt ? ` · ${document.uploadedAt}` : ""}
                </p>
              </div>
            </div>
            {document.url ? (
              <a
                aria-label={`Download ${document.name}`}
                className="text-muted"
                href={document.url}
                rel="noreferrer"
                target="_blank"
              >
                <Icon name="download" size={18} />
              </a>
            ) : (
              <span className="text-muted" aria-hidden>
                <Icon name="download" size={18} />
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
