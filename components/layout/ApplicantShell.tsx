"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Icon } from "@/components/ui/Icon";

const DOCK_LINKS = [
  { href: "/applicant/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/applicant/applications", label: "Applications", icon: "work" },
  { href: "/applicant/archived", label: "Archived", icon: "inventory_2" },
  { href: "/applicant/profile", label: "Profile", icon: "person" },
];

export function ApplicantShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const workspaceMatch = pathname.match(/^\/applicant\/applications\/([^/]+)$/);
  if (workspaceMatch && workspaceMatch[1] !== "new") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <Navbar role="applicant" userName={userName} />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 pb-24 lg:pb-8">
        {children}
      </main>
      <Footer />
      <nav
        aria-label="Mobile"
        className="dock lg:hidden z-40 border-t border-outline-variant bg-base-100"
      >
        {DOCK_LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link className={active ? "dock-active text-primary" : "text-muted"} href={link.href} key={link.href}>
              <Icon filled={active} name={link.icon} size={22} />
              <span className="dock-label">{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <Link
        aria-label="Add application"
        className="btn btn-primary btn-circle btn-lg fixed bottom-20 right-4 z-40 lg:hidden shadow-lg"
        href="/applicant/applications/new"
      >
        <Icon name="add" />
      </Link>
    </div>
  );
}
