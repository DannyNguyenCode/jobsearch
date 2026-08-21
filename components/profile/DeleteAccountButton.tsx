"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { ConfirmArchiveModal } from "@/components/ui/ConfirmArchiveModal";
import { Icon } from "@/components/ui/Icon";
import type { UserRole } from "@/lib/types";

type DeleteAccountButtonProps = {
  role: UserRole;
};

const COPY: Record<UserRole, { description: string; note: string }> = {
  applicant: {
    description:
      "This permanently deletes your applications and their comments, recruiter connection, personal information, and job preferences.",
    note: "All information will be deleted, including your login credentials. This cannot be undone.",
  },
  recruiter: {
    description:
      "This permanently deletes your profile and login. Connected applicants keep their accounts, but your recruiter ID is removed from them. Comments you left will show as Unknown user.",
    note: "All of your information will be deleted, including your login credentials. This cannot be undone.",
  },
};

export function DeleteAccountButton({ role }: DeleteAccountButtonProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const copy = COPY[role];

  async function confirmDelete() {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/account", { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not delete your account.");
        setOpen(false);
        return;
      }
      await signOut({ redirectTo: "/login" });
    } catch {
      setError("Could not delete your account. Try again.");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        className="w-full flex items-center justify-between p-4 bg-error/10 rounded-lg text-left"
        disabled={saving}
        type="button"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-3">
          <Icon className="text-error" name="delete" />
          <span>
            <span className="block font-medium text-error">Delete account</span>
            <span className="text-sm text-muted">Permanently remove your profile and login.</span>
          </span>
        </span>
        <Icon className="text-muted" name="chevron_right" />
      </button>
      {error ? <p className="text-error text-xs px-1">{error}</p> : null}
      <ConfirmArchiveModal
        confirmLabel="Delete account"
        description={copy.description}
        note={copy.note}
        open={open}
        title="Delete account?"
        onClose={() => setOpen(false)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
