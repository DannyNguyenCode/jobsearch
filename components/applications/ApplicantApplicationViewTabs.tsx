"use client";

import Link from "next/link";
import type { ApplicantApplicationsView } from "@/lib/applicant-application-views";

const VIEWS: Array<{ id: ApplicantApplicationsView; href: string; label: string }> = [
  { id: "all", href: "/applicant/applications", label: "All" },
  { id: "schedule", href: "/applicant/applications?view=schedule", label: "Interviews" },
  { id: "pending", href: "/applicant/applications?view=pending", label: "Pending actions" },
];

export function ApplicantApplicationViewTabs({ view }: { view: ApplicantApplicationsView }) {
  return (
    <div className="join">
      {VIEWS.map((item) => (
        <Link
          aria-current={item.id === view ? "page" : undefined}
          className={`btn btn-sm join-item ${item.id === view ? "btn-primary" : "btn-ghost"}`}
          href={item.href}
          key={item.id}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
