import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function AuthBrand() {
  return (
    <Link className="flex items-center gap-2 text-primary font-bold text-2xl" href="/login">
      <Icon name="work" filled size={28} />
      Job Tracker Hub
    </Link>
  );
}

export function AuthCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full max-w-[440px] bg-base-100 rounded-xl border border-outline-variant shadow-[0_12px_32px_rgba(15,98,254,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}