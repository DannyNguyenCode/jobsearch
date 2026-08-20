"use client";

import { useEffect, useId, useState } from "react";
import { ManagedApplicantsSidebar } from "./ManagedApplicantsSidebar";
import { Icon } from "@/components/ui/Icon";
import type { ManagedApplicantSummary } from "@/lib/managed-applicants";

const DRAWER_ID = "managed-applicants-drawer";

type ManagedApplicantsDrawerProps = {
  applicants: ManagedApplicantSummary[];
  selectedApplicant: ManagedApplicantSummary;
  children: React.ReactNode;
};

export function ManagedApplicantsDrawer({
  applicants,
  selectedApplicant,
  children,
}: ManagedApplicantsDrawerProps) {
  const [open, setOpen] = useState(false);
  const headingId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="drawer lg:drawer-open lg:gap-6">
      <input
        aria-hidden="true"
        checked={open}
        className="drawer-toggle"
        id={DRAWER_ID}
        tabIndex={-1}
        type="checkbox"
        onChange={(event) => setOpen(event.target.checked)}
      />
      <div className="drawer-content min-w-0 space-y-4">
        <div className="lg:hidden card-surface p-3 flex items-center gap-3">
          <button
            aria-controls={DRAWER_ID}
            aria-expanded={open}
            aria-label="Open managed applicants"
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => setOpen(true)}
          >
            <Icon name="menu" size={18} />
            Applicants
          </button>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted">Selected applicant</p>
            <p className="font-semibold truncate">{selectedApplicant.name}</p>
          </div>
        </div>
        {children}
      </div>
      <div className="drawer-side z-50 lg:z-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6.5rem)]">
        <button
          aria-label="Close managed applicants"
          className="drawer-overlay lg:hidden"
          type="button"
          onClick={() => setOpen(false)}
        />
        <div
          aria-labelledby={headingId}
          aria-modal={open || undefined}
          className="min-h-full w-80 max-w-[85vw] p-3 lg:p-0 lg:max-w-none"
          role={open ? "dialog" : undefined}
        >
          <div className="lg:hidden flex items-center justify-end mb-3">
            <button
              aria-label="Close managed applicants"
              className="btn btn-ghost btn-sm btn-circle"
              type="button"
              onClick={() => setOpen(false)}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <ManagedApplicantsSidebar
            applicants={applicants}
            headingId={headingId}
            searchInputId="managed-applicant-search"
            selectedId={selectedApplicant.id}
            onSelectApplicant={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
