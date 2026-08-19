"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmArchiveModal } from "@/components/ui/ConfirmArchiveModal";
import { Icon } from "@/components/ui/Icon";
import { isArchivedStatus } from "@/lib/status";
import type { ApplicationStatus } from "@/lib/types";

type LifecycleAction = "archive" | "restore" | "delete";

type ApplicationLifecycleActionsProps = {
  applicationId: string;
  status: ApplicationStatus;
  layout?: "stack" | "row";
};

const COPY: Record<LifecycleAction, { title: string; description: string; confirmLabel: string }> = {
  archive: {
    title: "Archive application?",
    description: "This application will move to Archived applications. You can restore it or delete it permanently later.",
    confirmLabel: "Archive",
  },
  restore: {
    title: "Restore application?",
    description: "This application will return to your active tracker as Applied.",
    confirmLabel: "Restore",
  },
  delete: {
    title: "Delete application permanently?",
    description: "This removes the application, notes, and timeline from Job Tracker Hub. This cannot be undone.",
    confirmLabel: "Delete permanently",
  },
};

export function ApplicationLifecycleActions({
  applicationId,
  status,
  layout = "stack",
}: ApplicationLifecycleActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<LifecycleAction | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const inArchive = isArchivedStatus(status);

  async function run(action: LifecycleAction) {
    setWorking(true);
    setError("");
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: action === "delete" ? "DELETE" : "PATCH",
        headers: action === "delete" ? undefined : { "Content-Type": "application/json" },
        body: action === "delete" ? undefined : JSON.stringify({ status: action === "archive" ? "archived" : "applied" }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not update the application.");
        setPending(null);
        return;
      }
      setPending(null);
      router.push(action === "archive" ? "/applicant/archived" : "/applicant/dashboard");
      router.refresh();
    } catch {
      setError("Could not update the application. Try again.");
      setPending(null);
    } finally {
      setWorking(false);
    }
  }

  const buttons = (
    <>
      {inArchive ? (
        <button
          className={layout === "stack" ? "btn btn-outline btn-primary" : "btn btn-ghost btn-sm"}
          disabled={working}
          type="button"
          onClick={() => setPending("restore")}
        >
          <Icon name="history" size={18} />
          Restore
        </button>
      ) : (
        <button
          className={layout === "stack" ? "btn btn-outline" : "btn btn-ghost btn-sm"}
          disabled={working}
          type="button"
          onClick={() => setPending("archive")}
        >
          <Icon name="inventory_2" size={18} />
          Archive
        </button>
      )}
      <button
        className={layout === "stack" ? "btn btn-outline btn-error" : "btn btn-ghost btn-sm text-error"}
        disabled={working}
        type="button"
        onClick={() => setPending("delete")}
      >
        <Icon name="delete" size={18} />
        Delete
      </button>
    </>
  );

  return (
    <div className={layout === "stack" ? "flex flex-col gap-2" : "flex items-center justify-end gap-1"}>
      {buttons}
      {error ? <p className="text-error text-xs">{error}</p> : null}
      <ConfirmArchiveModal
        cancelLabel="Cancel"
        confirmLabel={pending ? COPY[pending].confirmLabel : "Confirm"}
        description={pending ? COPY[pending].description : ""}
        open={pending !== null}
        title={pending ? COPY[pending].title : ""}
        onClose={() => {
          if (!working) setPending(null);
        }}
        onConfirm={() => {
          if (pending) void run(pending);
        }}
      />
    </div>
  );
}
