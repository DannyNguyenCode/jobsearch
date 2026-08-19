import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-8">
          <LoadingSkeleton rows={2} />
        </div>
      }
    >
      <VerifyEmailCard />
    </Suspense>
  );
}
