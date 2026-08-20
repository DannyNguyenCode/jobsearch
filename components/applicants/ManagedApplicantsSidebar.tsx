"use client";

import { useMemo, useState } from "react";
import { ApplicantSearchInput } from "./ApplicantSearchInput";
import { ManagedApplicantItem } from "./ManagedApplicantItem";
import { filterManagedApplicants, type ManagedApplicantSummary } from "@/lib/managed-applicants";

type ManagedApplicantsSidebarProps = {
  applicants: ManagedApplicantSummary[];
  selectedId: string;
  searchInputId?: string;
  headingId?: string;
  onSelectApplicant?: () => void;
};

export function ManagedApplicantsSidebar({
  applicants,
  selectedId,
  searchInputId,
  headingId,
  onSelectApplicant,
}: ManagedApplicantsSidebarProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterManagedApplicants(applicants, query), [applicants, query]);

  return (
    <aside className="flex w-full lg:w-80 shrink-0 flex-col bg-base-100 border border-outline-variant rounded-xl overflow-hidden h-full min-h-0">
      <div className="p-4 border-b border-outline-variant space-y-3">
        <div>
          <h2 className="font-semibold" id={headingId}>
            Managed Applicants
          </h2>
          <p className="text-sm text-muted">
            {applicants.length} {applicants.length === 1 ? "applicant" : "applicants"}
          </p>
        </div>
        <ApplicantSearchInput id={searchInputId} value={query} onChange={setQuery} />
      </div>
      <nav aria-label="Managed applicants" className="p-3 space-y-1 overflow-y-auto scrollbar-thin flex-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted px-2 py-4">No applicants match that search.</p>
        ) : (
          filtered.map((applicant) => (
            <ManagedApplicantItem
              applicant={applicant}
              key={applicant.id}
              selected={applicant.id === selectedId}
              onSelect={onSelectApplicant}
            />
          ))
        )}
      </nav>
    </aside>
  );
}
