"use client";

import { useMemo, useState } from "react";
import { ApplicantSidebarItem } from "./ApplicantSidebarItem";
import { Icon } from "@/components/ui/Icon";
import type { Applicant } from "@/lib/types";

export function ApplicantPipelineSidebar({ applicants }: { applicants: Applicant[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return applicants;
    return applicants.filter(
      (item) =>
        item.name.toLowerCase().includes(term) || item.title.toLowerCase().includes(term),
    );
  }, [applicants, query]);

  const list = (
    <div className="space-y-1">
      {filtered.length === 0 ? (
        <p className="text-sm text-muted px-2 py-4">No applicants match that search.</p>
      ) : (
        filtered.map((item) => (
          <ApplicantSidebarItem
            applicant={item}
            href={`/recruiter/applicants/${item.id}`}
            key={item.id}
          />
        ))
      )}
    </div>
  );

  return (
    <>
      <details className="xl:hidden collapse collapse-arrow card-surface">
        <summary className="collapse-title font-semibold min-h-12">
          Applicant pipeline ({applicants.length})
        </summary>
        <div className="collapse-content">
          <label className="input flex items-center gap-2 mb-3">
            <Icon className="text-outline" name="search" size={18} />
            <input
              aria-label="Search applicants"
              className="grow"
              placeholder="Search applicants..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {list}
        </div>
      </details>
      <aside className="hidden xl:flex w-80 shrink-0 flex-col bg-base-100 border border-outline-variant rounded-xl overflow-hidden sticky top-20 max-h-[calc(100vh-6.5rem)]">
        <div className="p-4 border-b border-outline-variant">
          <label className="input flex items-center gap-2">
            <Icon className="text-outline" name="search" size={18} />
            <input
              aria-label="Search applicants"
              className="grow"
              placeholder="Search applicants..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="text-xs uppercase tracking-wider text-muted px-2 py-1">Active pipeline</p>
          {list}
        </div>
      </aside>
    </>
  );
}
