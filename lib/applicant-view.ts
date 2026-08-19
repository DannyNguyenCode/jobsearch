import { formatDisplayDate } from "@/lib/dates";
import type { Applicant } from "@/lib/types";

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part[0] ?? "");
  return letters.join("").toUpperCase() || "?";
}

export function toApplicantView(
  user: {
    _id: unknown;
    fullName: string;
    email: string;
    dateSignedUp?: Date;
  },
  extras?: Partial<Pick<Applicant, "title" | "location" | "phone">>,
): Applicant {
  const joined =
    user.dateSignedUp instanceof Date ? formatDisplayDate(user.dateSignedUp) : "";
  return {
    id: String(user._id),
    name: user.fullName,
    email: user.email,
    phone: extras?.phone ?? "",
    location: extras?.location ?? "",
    title: extras?.title ?? "Applicant",
    experienceYears: 0,
    salaryExpectation: "",
    fitScore: 0,
    recruiterId: "",
    initials: initialsFromName(user.fullName),
    joined,
    openToRelocation: false,
    remotePreferred: false,
  };
}
