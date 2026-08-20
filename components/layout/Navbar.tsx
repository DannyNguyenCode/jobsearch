"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { UserRole } from "@/lib/types";

type NavbarProps = {
  role: UserRole | "guest";
  userName?: string;
};

const APPLICANT_LINKS = [
  { href: "/applicant/dashboard", label: "Dashboard" },
  { href: "/applicant/applications", label: "Applications" },
  { href: "/applicant/archived", label: "Archived" },
  { href: "/applicant/profile", label: "Profile" },
];

const RECRUITER_LINKS = [
  { href: "/recruiter/dashboard", label: "Dashboard" },
  { href: "/recruiter/applicants", label: "Applicants" },
  { href: "/recruiter/profile", label: "Profile" },
];

export function Navbar({ role, userName }: NavbarProps) {
  const pathname = usePathname();
  const links = role === "recruiter" ? RECRUITER_LINKS : role === "applicant" ? APPLICANT_LINKS : [];
  const homeHref =
    role === "recruiter" ? "/recruiter/dashboard" : role === "applicant" ? "/applicant/dashboard" : "/login";
  const profileHref = role === "recruiter" ? "/recruiter/profile" : "/applicant/profile";

  return (
    <header className="navbar sticky top-0 z-40 bg-base-100 border-b border-outline-variant min-h-16 px-4 md:px-8">
      <div className="flex-1 gap-3 min-w-0">
        <Link className="flex items-center gap-2 text-primary font-bold text-lg md:text-xl shrink-0" href={homeHref}>
          <Icon name="work" filled />
          Job Tracker Hub
        </Link>
        {links.length > 0 ? (
          <nav aria-label="Primary" className="hidden md:flex items-center gap-6 ml-6">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={`font-medium transition-colors ${
                    active ? "text-primary" : "text-muted hover:text-primary"
                  }`}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
            <LogoutButton className="text-muted hover:text-primary font-medium transition-colors">
              Logout
            </LogoutButton>
          </nav>
        ) : null}
      </div>
      {role !== "guest" ? (
        <div className="flex items-center gap-1">
          <button aria-label="Search" className="btn btn-ghost btn-circle" type="button">
            <Icon name="search" />
          </button>
          <button aria-label="Notifications" className="btn btn-ghost btn-circle" type="button">
            <Icon name="notifications" />
          </button>
          <button aria-label="Settings" className="btn btn-ghost btn-circle" type="button">
            <Icon name="settings" />
          </button>
          <Link aria-label={`${userName ?? "User"} profile`} className="ml-1" href={profileHref}>
            <Avatar name={userName ?? "User"} size="sm" />
          </Link>
        </div>
      ) : null}
    </header>
  );
}
