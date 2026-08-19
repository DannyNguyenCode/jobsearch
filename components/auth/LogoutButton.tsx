"use client";

import { signOut } from "next-auth/react";

type LogoutButtonProps = {
  className?: string;
  children: React.ReactNode;
};

export function LogoutButton({ className, children }: LogoutButtonProps) {
  return (
    <button className={className} type="button" onClick={() => signOut({ redirectTo: "/login" })}>
      {children}
    </button>
  );
}
