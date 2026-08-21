import { formatDisplayDate } from "@/lib/dates";
import type { Applicant } from "@/lib/types";

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0] ?? "");
  return letters.join("").toUpperCase() || "?";
}

type ApplicantProfileFields = Pick<Applicant, "title" | "location" | "phone" | "openToRelocation" | "remotePreferred">;

export function toApplicantView(
  user: {
    _id: unknown;
    fullName: string;
    email: string;
    dateSignedUp?: Date;
    phone?: string | null;
    location?: string | null;
    openToRelocation?: boolean | null;
    remotePreferred?: boolean | null;
  },
  extras?: Partial<ApplicantProfileFields>,
): Applicant {
  const joined =
    user.dateSignedUp instanceof Date ? formatDisplayDate(user.dateSignedUp) : "";
  return {
    id: String(user._id),
    name: user.fullName,
    email: user.email,
    phone: extras?.phone ?? user.phone ?? "",
    location: extras?.location ?? user.location ?? "",
    title: extras?.title ?? "Applicant",
    experienceYears: 0,
    salaryExpectation: "",
    fitScore: 0,
    recruiterId: "",
    initials: initialsFromName(user.fullName),
    joined,
    openToRelocation: extras?.openToRelocation ?? Boolean(user.openToRelocation),
    remotePreferred: extras?.remotePreferred ?? Boolean(user.remotePreferred),
  };
}
