"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import type { Applicant } from "@/lib/types";

type ApplicantSidebarItemProps = {
  applicant: Applicant;
  href: string;
};

export function ApplicantSidebarItem({ applicant, href }: ApplicantSidebarItemProps) {
  const pathname = usePathname();
  const active = pathname.startsWith(`/recruiter/applicants/${applicant.id}`);

  return (
    <Link
      className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${
        active
          ? "bg-primary/10 border border-primary/20 relative"
          : "hover:bg-base-200 border border-transparent"
      }`}
      href={href}
    >
      {active ? <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" /> : null}
      <Avatar name={applicant.name} initials={applicant.initials} size="md" />
      <span className="min-w-0">
        <span className={`block truncate font-medium ${active ? "text-primary" : ""}`}>
          {applicant.name}
        </span>
        <span className="block truncate text-sm text-muted">{applicant.title}</span>
      </span>
    </Link>
  );
}