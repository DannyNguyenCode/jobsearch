"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Icon } from "@/components/ui/Icon";

const MOBILE_LINKS = [
  { href: "/recruiter/dashboard", label: "Home", icon: "home" },
  { href: "/recruiter/applicants", label: "Applicants", icon: "group" },
  { href: "/recruiter/profile", label: "Profile", icon: "person" },
];

export function RecruiterShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  if (/\/applicants\/[^/]+\/applications\/[^/]+$/.test(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      <Navbar role="recruiter" userName={userName} />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 pb-24 lg:pb-8">
        {children}
      </main>
      <Footer />
      <nav
        aria-label="Mobile"
        className="dock lg:hidden z-40 border-t border-outline-variant bg-base-100"
      >
        {MOBILE_LINKS.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link className={active ? "dock-active text-primary" : "text-muted"} href={link.href} key={link.href}>
              <Icon filled={active} name={link.icon} size={22} />
              <span className="dock-label">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
