import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import type { ManagedApplicantSummary } from "@/lib/managed-applicants";

type ManagedApplicantItemProps = {
  applicant: ManagedApplicantSummary;
  selected: boolean;
  onSelect?: () => void;
};

function countLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function ManagedApplicantItem({ applicant, selected, onSelect }: ManagedApplicantItemProps) {
  const href = `/recruiter/applicants/${applicant.id}`;
  const meta = [
    countLabel(applicant.activeCount, "active", "active"),
    countLabel(applicant.interviewCount, "interview", "interviews"),
  ].join(" • ");

  return (
    <Link
      aria-current={selected ? "page" : undefined}
      className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors focus-visible:outline-2 ${
        selected
          ? "bg-primary/10 border border-primary/20 relative text-primary"
          : "hover:bg-base-200 border border-transparent"
      }`}
      href={href}
      onClick={onSelect}
    >
      {selected ? <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" /> : null}
      <Avatar name={applicant.name} initials={applicant.initials} size="md" />
      <span className="min-w-0">
        <span className={`block truncate font-medium ${selected ? "text-primary" : ""}`}>
          {applicant.name}
        </span>
        {applicant.jobField ? (
          <span className="block truncate text-sm text-muted">{applicant.jobField}</span>
        ) : null}
        <span className="block truncate text-xs text-muted">{meta}</span>
      </span>
    </Link>
  );
}
