import Link from "next/link";
import { CookieSettingsButton } from "@/components/layout/CookieConsent";

export function Footer() {
  return (
    <footer className="bg-base-100 border-t border-outline-variant mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-semibold">Job Tracker Hub</p>
        <p className="text-sm text-secondary">© 2026 Job Tracker Hub. All rights reserved.</p>
        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-4 text-xs text-muted">
          <Link className="hover:text-primary hover:underline" href="#">
            Terms of Service
          </Link>
          <Link className="hover:text-primary hover:underline" href="#">
            Privacy Policy
          </Link>
          <Link className="hover:text-primary hover:underline" href="#">
            Support
          </Link>
          <CookieSettingsButton className="hover:text-primary hover:underline cursor-pointer bg-transparent border-0 p-0 text-inherit font-inherit" />
        </nav>
      </div>
    </footer>
  );
}