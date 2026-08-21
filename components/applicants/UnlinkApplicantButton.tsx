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
        setError(result.error ?? "Could not remove this applicant.");
        setOpen(false);
        return;
      }
      setOpen(false);
      router.push("/recruiter/applicants");
      router.refresh();
    } catch {
      setError("Could not remove this applicant. Try again.");
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2">
      <button className="btn btn-outline btn-error" disabled={saving} type="button" onClick={() => setOpen(true)}>
        <Icon name="link" size={18} />
        Remove Applicant
      </button>
      {error ? <p className="text-error text-xs">{error}</p> : null}
      <ConfirmArchiveModal
        confirmLabel="Remove Applicant"
        description={`${applicantName} will no longer be linked to your recruiter code. They will get an email that they have been removed.`}
        open={open}
        title="Remove this applicant?"
        onClose={() => setOpen(false)}
        onConfirm={() => void confirmUnlink()}
      />
    </div>
  );
}
