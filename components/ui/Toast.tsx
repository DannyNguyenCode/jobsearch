"use client";

import { Icon } from "./Icon";

type ToastProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
};

export function Toast({ open, title, description, onClose }: ToastProps) {
  if (!open) return null;

  return (
    <div className="toast toast-end z-50">
      <div className="alert bg-base-100 border border-outline-variant shadow-lg max-w-sm">
        <div className="text-secondary">
          <Icon name="check_circle" filled />
        </div>
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          {description ? <p className="text-sm text-muted">{description}</p> : null}
        </div>
        <button
          aria-label="Dismiss notification"
          className="btn btn-ghost btn-sm btn-circle"
          type="button"
          onClick={onClose}
        >
          <Icon name="close" size={18} />
        </button>
      </div>
    </div>
  );
}