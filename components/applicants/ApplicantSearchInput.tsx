"use client";

import { Icon } from "@/components/ui/Icon";

type ApplicantSearchInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
};

export function ApplicantSearchInput({
  id = "managed-applicant-search",
  value,
  onChange,
}: ApplicantSearchInputProps) {
  return (
    <label className="input flex items-center gap-2 w-full">
      <Icon className="text-outline" name="search" size={18} />
      <span className="sr-only">Search applicants</span>
      <input
        aria-label="Search applicants"
        className="grow"
        id={id}
        placeholder="Search applicants"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
