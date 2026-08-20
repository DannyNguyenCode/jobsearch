export type UserRole = "applicant" | "recruiter";

export type ApplicationStatus =
  | "planning"
  | "applied"
  | "screening"
  | "assessment"
  | "interview"
  | "offer"
  | "rejected"
  | "archived"
  | "withdrawn";

export type ApplicationSource = "jobBoard" | "companySite" | "recruiter" | "referral" | "other";

export type DocumentKind = "resume" | "coverLetter" | "jobPosting" | "other";

export type ApplicationDocument = {
  id: string;
  kind: DocumentKind;
  name: string;
  sizeLabel: string;
  uploadedAt: string;
  url?: string;
};

export type ApplicationComment = {
  id: string;
  authorId?: string;
  author: string;
  authorInitials: string;
  authorRole?: UserRole;
  createdAt: string;
  body: string;
};

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  tone?: "primary" | "secondary" | "neutral" | "success";
  status?: ApplicationStatus;
  note?: ApplicationComment;
};

export type JobApplication = {
  id: string;
  dateApplied: string;
  statusDate?: string;
  organization: string;
  location: string;
  phone: string;
  contactName: string;
  contactEmail: string;
  position: string;
  notes: string;
  status: ApplicationStatus;
  postingUrl: string;
  source: ApplicationSource;
  applicantId: string;
  applicantName?: string;
  applicantEmail?: string;
  documents: ApplicationDocument[];
  comments: ApplicationComment[];
  timeline: TimelineEvent[];
  nextAction?: string;
};

export type Applicant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  experienceYears: number;
  salaryExpectation: string;
  fitScore: number;
  recruiterId: string;
  initials: string;
  joined: string;
  openToRelocation: boolean;
  remotePreferred: boolean;
};

export type Recruiter = {
  id: string;
  recruiterCode: string;
  name: string;
  preferredName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  initials: string;
  applicantsManaged: number;
};