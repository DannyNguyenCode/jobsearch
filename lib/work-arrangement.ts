export const WORK_ARRANGEMENTS = ["REMOTE", "HYBRID", "ONSITE"] as const;

export type WorkArrangement = (typeof WORK_ARRANGEMENTS)[number];

export const WORK_ARRANGEMENT_LABELS: Record<WorkArrangement, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

export function isWorkArrangement(value: unknown): value is WorkArrangement {
  return typeof value === "string" && (WORK_ARRANGEMENTS as readonly string[]).includes(value);
}
