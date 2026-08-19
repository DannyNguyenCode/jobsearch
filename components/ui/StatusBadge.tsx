import { statusClass, STATUS_LABELS } from "@/lib/status";
import type { ApplicationStatus } from "@/lib/types";

type StatusBadgeProps = {
  status: ApplicationStatus;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const text = label ?? STATUS_LABELS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border font-semibold text-xs ${statusClass(status)} ${className}`}
    >
      <span className="sr-only">Status:</span>
      {text}
    </span>
  );
}