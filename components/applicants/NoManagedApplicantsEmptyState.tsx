import { CopyButton } from "@/components/ui/CopyButton";
import { EmptyState } from "@/components/ui/EmptyState";

type NoManagedApplicantsEmptyStateProps = {
  recruiterCode: string;
};

export function NoManagedApplicantsEmptyState({ recruiterCode }: NoManagedApplicantsEmptyStateProps) {
  return (
    <EmptyState
      action={
        recruiterCode ? (
          <div className="space-y-2">
            <p className="text-sm text-muted">Your recruiter code:</p>
            <div className="flex items-center justify-center gap-2 bg-base-100 px-4 py-2 rounded-lg border border-outline-variant">
              <span className="font-bold tracking-widest text-primary">{recruiterCode}</span>
              <CopyButton label="Copy recruiter code" value={recruiterCode} />
            </div>
          </div>
        ) : null
      }
      description="Applicants can use this code to connect their Job Tracker account with you."
      icon="group"
      title="No managed applicants yet"
    />
  );
}
