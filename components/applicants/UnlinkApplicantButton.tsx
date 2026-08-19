"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmArchiveModal } from "@/components/ui/ConfirmArchiveModal";
import { Icon } from "@/components/ui/Icon";

type UnlinkApplicantButtonProps = {
  applicantId: string;
  applicantName: string;
};

export function UnlinkApplicantButton({ applicantId, applicantName }: UnlinkApplicantButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function confirmUnlink() {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/applicants/${applicantId}/link`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not end this relationship.");
        setOpen(false);
        return;
      }
      setOpen(false);
      router.push("/recruiter/applicants");
      router.refresh();
    } catch {
      setError("Could not end this relationship. Try again.");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2">
      <button className="btn btn-outline btn-error" disabled={saving} type="button" onClick={() => setOpen(true)}>
        <Icon name="link" size={18} />
        End relationship
      </button>
      {error ? <p className="text-error text-xs">{error}</p> : null}
      <ConfirmArchiveModal
        confirmLabel="Remove connection"
        description={`${applicantName} will no longer be linked to your recruiter code. They will get an email that this relationship has ended.`}
        open={open}
        title="End this relationship?"
        onClose={() => setOpen(false)}
        onConfirm={() => void confirmUnlink()}
      />
    </div>
  );
}
