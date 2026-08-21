"use client";

import { useId } from "react";
import { Icon } from "./Icon";

type ConfirmArchiveModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  note?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmArchiveModal({
  open,
  title = "Archive application?",
  description = "This application will move to your archive. You can restore or delete it later from Archived applications.",
  note,
  confirmLabel = "Archive",
  cancelLabel = "Cancel",
  onConfirm,
  onClose,
}: ConfirmArchiveModalProps) {
  const titleId = useId();

  if (!open) return null;

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="modal-box">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
            <Icon name="warning" />
          </div>
          <div>
            <h2 id={titleId} className="font-semibold text-lg">
              {title}
            </h2>
            <p className="text-sm text-muted mt-2">{description}</p>
            {note ? <p className="text-sm text-error mt-2">{note}</p> : null}
          </div>
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            {cancelLabel}
          </button>
          <button className="btn btn-error text-error-content" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
      <button className="modal-backdrop bg-neutral/40" type="button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}