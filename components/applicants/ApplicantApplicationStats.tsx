type ApplicantApplicationStatsProps = {
  activeCount: number;
  interviewCount: number;
  offerCount: number;
};

export function ApplicantApplicationStats({
  activeCount,
  interviewCount,
  offerCount,
}: ApplicantApplicationStatsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="badge badge-primary badge-lg">{activeCount} Active</span>
      <span className="badge badge-outline badge-lg">{interviewCount} Interview</span>
      <span className="badge badge-outline badge-lg">{offerCount} Offers</span>
    </div>
  );
}
