export function RecruiterApplicantsLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading managed applicants</span>
      <div className="hidden lg:block w-80 shrink-0">
        <div className="skeleton h-[28rem] rounded-xl" />
      </div>
      <div className="flex-1 min-w-0 space-y-4">
        <div className="skeleton h-36 rounded-xl" />
        <div className="skeleton h-16 rounded-xl" />
        <div className="skeleton h-20 rounded-xl" />
        <div className="skeleton h-20 rounded-xl" />
        <div className="skeleton h-20 rounded-xl" />
      </div>
    </div>
  );
}
