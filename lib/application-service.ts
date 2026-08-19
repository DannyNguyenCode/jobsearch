import { dbConnect } from "@/lib/db";
import { Application, type ApplicationDocument } from "@/lib/models/Application";
import { User, type UserDocument } from "@/lib/models/User";
import { initialsFromName, toApplicantView } from "@/lib/applicant-view";
import { formatDisplayDate, formatDisplayDateTime, parseDateInput, toDateInput } from "@/lib/dates";
import { isObjectId } from "@/lib/object-id";
import { ARCHIVE_STATUSES, isArchivedStatus, nextActionFor, STATUS_LABELS } from "@/lib/status";
import type { ApplicationInput, ApplicationUpdate } from "@/lib/validators/application";
import { DOCUMENT_KIND_LABELS, type DocumentUploadKind } from "@/lib/document-kind";
import type {
  Applicant,
  ApplicationStatus,
  ApplicationComment,
  DocumentKind,
  JobApplication,
  TimelineEvent,
  UserRole,
} from "@/lib/types";

export type Viewer = {
  id: string;
  role: UserRole;
  referenceCode: string;
};

type TimelineTone = NonNullable<TimelineEvent["tone"]>;

function asId(value: unknown) {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value ?? "");
}

function serializeDocuments(application: ApplicationDocument): JobApplication["documents"] {
  return (application.documents ?? []).map((document) => ({
    id: asId(document),
    kind: document.kind as DocumentKind,
    name: document.name,
    sizeLabel: document.sizeLabel ?? "",
    uploadedAt: document.uploadedAt ? formatDisplayDate(document.uploadedAt) : "",
    url: document.url || undefined,
  }));
}

function commentList(application: ApplicationDocument) {
  const current = application.comments ?? [];
  if (current.length > 0) return current;
  const legacy = (application as ApplicationDocument & { recruiterNotes?: ApplicationDocument["comments"] })
    .recruiterNotes;
  return legacy ?? [];
}

function serializeComments(application: ApplicationDocument): ApplicationComment[] {
  return [...commentList(application)]
    .sort((left, right) => (left.createdAt?.getTime() ?? 0) - (right.createdAt?.getTime() ?? 0))
    .map((comment) => ({
      id: asId(comment),
      authorId: comment.authorId ? asId(comment.authorId) : undefined,
      author: comment.author,
      authorInitials: comment.authorInitials,
      authorRole: comment.authorRole === "applicant" ? "applicant" : "recruiter",
      createdAt: comment.createdAt ? formatDisplayDateTime(comment.createdAt) : "",
      body: comment.body,
    }));
}

function serializeTimeline(application: ApplicationDocument): TimelineEvent[] {
  return [...(application.timeline ?? [])]
    .sort((left, right) => (right.timestamp?.getTime() ?? 0) - (left.timestamp?.getTime() ?? 0))
    .map((event) => ({
      id: asId(event),
      title: event.title,
      description: event.description,
      timestamp: event.timestamp ? formatDisplayDateTime(event.timestamp) : "",
      icon: event.icon,
      tone: (event.tone as TimelineTone | undefined) ?? "neutral",
    }));
}

export function serializeApplication(
  application: ApplicationDocument,
  applicant?: Pick<UserDocument, "fullName" | "email">,
): JobApplication {
  return {
    id: String(application._id),
    dateApplied: toDateInput(application.dateApplied),
    organization: application.organization,
    location: application.location,
    phone: application.phone,
    contactName: application.contactName,
    contactEmail: application.contactEmail,
    position: application.position,
    notes: application.notes,
    status: application.status,
    postingUrl: application.postingUrl,
    source: application.source,
    applicantId: asId(application.applicantId),
    applicantName: applicant?.fullName,
    applicantEmail: applicant?.email,
    documents: serializeDocuments(application),
    comments: serializeComments(application),
    timeline: serializeTimeline(application),
    nextAction: nextActionFor(application.status),
  };
}

function loggedEvent(input: ApplicationInput) {
  return {
    title: "Application logged",
    description: `${input.position} at ${input.organization}`,
    timestamp: new Date(),
    icon: "description",
    tone: "primary" as const,
  };
}

function statusEvent(status: ApplicationStatus, organization: string) {
  return {
    title: STATUS_LABELS[status],
    description: `Status updated for ${organization}`,
    timestamp: new Date(),
    icon: status === "offer" ? "handshake" : status === "interview" ? "video_camera_front" : "flag",
    tone: (status === "offer" ? "success" : status === "rejected" ? "neutral" : "secondary") as TimelineTone,
  };
}

async function linkedApplicants(recruiterCode: string) {
  if (!recruiterCode) return [];
  return User.find({ role: "applicant", referenceCode: recruiterCode }).sort({ fullName: 1 });
}

export async function listApplicationsForApplicant(applicantId: string, view: "active" | "archive" = "active") {
  await dbConnect();
  const statusFilter =
    view === "archive" ? { status: { $in: ARCHIVE_STATUSES } } : { status: { $nin: ARCHIVE_STATUSES } };
  const rows = await Application.find({ applicantId, ...statusFilter }).sort({ dateApplied: -1, createdAt: -1 });
  return rows.map((row) => serializeApplication(row));
}

export async function listApplicationsForRecruiter(recruiterCode: string, view: "active" | "archive" = "active") {
  await dbConnect();
  const applicants = await linkedApplicants(recruiterCode);
  const applicantById = new Map(applicants.map((applicant) => [String(applicant._id), applicant]));
  const statusFilter =
    view === "archive" ? { status: { $in: ARCHIVE_STATUSES } } : { status: { $nin: ARCHIVE_STATUSES } };
  const rows = await Application.find({
    applicantId: { $in: [...applicantById.keys()] },
    ...statusFilter,
  }).sort({ dateApplied: -1, createdAt: -1 });
  return rows.map((row) => serializeApplication(row, applicantById.get(asId(row.applicantId))));
}

export async function listLinkedApplicants(recruiterCode: string): Promise<Applicant[]> {
  await dbConnect();
  const applicants = await linkedApplicants(recruiterCode);
  const applications = await Application.find({
    applicantId: { $in: applicants.map((applicant) => applicant._id) },
  }).sort({ dateApplied: -1 });

  const latestByApplicant = new Map<string, ApplicationDocument>();
  for (const application of applications) {
    const key = asId(application.applicantId);
    if (!latestByApplicant.has(key)) latestByApplicant.set(key, application);
  }

  return applicants.map((applicant) => {
    const latest = latestByApplicant.get(String(applicant._id));
    return toApplicantView(applicant, {
      title: latest?.position ?? "Applicant",
      location: latest?.location ?? "",
    });
  });
}

export async function loadApplicationForViewer(applicationId: string, viewer: Viewer) {
  if (!isObjectId(applicationId)) return null;
  await dbConnect();
  const application = await Application.findById(applicationId);
  if (!application) return null;
  const applicant = await User.findById(application.applicantId);
  if (!applicant || applicant.role !== "applicant") return null;
  if (viewer.role === "applicant") {
    if (String(applicant._id) !== viewer.id) return null;
  } else if (viewer.role === "recruiter") {
    if (!viewer.referenceCode || applicant.referenceCode !== viewer.referenceCode) return null;
  } else {
    return null;
  }
  return {
    application: serializeApplication(application, applicant),
    applicant: toApplicantView(applicant, {
      title: application.position,
      location: application.location,
    }),
    record: application,
  };
}

export async function loadApplicationForApplicant(applicationId: string, applicantId: string) {
  return loadApplicationForViewer(applicationId, {
    id: applicantId,
    role: "applicant",
    referenceCode: "",
  });
}

export async function loadApplicantForRecruiter(applicantId: string, recruiterCode: string) {
  if (!isObjectId(applicantId) || !recruiterCode) return null;
  await dbConnect();
  const applicant = await User.findOne({
    _id: applicantId,
    role: "applicant",
    referenceCode: recruiterCode,
  });
  if (!applicant) return null;
  const history = await Application.find({ applicantId }).sort({ dateApplied: -1, createdAt: -1 });
  const latest = history.find((item) => !isArchivedStatus(item.status)) ?? history[0];
  return {
    applicant: toApplicantView(applicant, {
      title: latest?.position ?? "Applicant",
      location: latest?.location ?? "",
    }),
    applications: history.map((item) => serializeApplication(item, applicant)),
  };
}

export async function unlinkApplicantFromRecruiter(applicantId: string, recruiterCode: string) {
  if (!isObjectId(applicantId) || !recruiterCode) return null;
  await dbConnect();
  const applicant = await User.findOne({
    _id: applicantId,
    role: "applicant",
    referenceCode: recruiterCode,
  });
  if (!applicant) return null;
  applicant.referenceCode = "";
  await applicant.save();
  return {
    id: String(applicant._id),
    name: applicant.fullName,
    email: applicant.email,
  };
}

export async function createApplication(applicantId: string, input: ApplicationInput) {
  await dbConnect();
  const dateApplied = parseDateInput(input.dateApplied);
  const created = await Application.create({
    applicantId,
    position: input.position,
    organization: input.organization,
    location: input.location,
    postingUrl: input.postingUrl,
    source: input.source,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    phone: input.phone,
    notes: input.notes,
    dateApplied,
    status: input.status,
    documents: [],
    comments: [],
    timeline: [loggedEvent(input)],
  });
  return serializeApplication(created);
}

export async function updateApplication(record: ApplicationDocument, input: ApplicationUpdate) {
  const previousStatus = record.status;
  if (input.position !== undefined) record.position = input.position;
  if (input.organization !== undefined) record.organization = input.organization;
  if (input.location !== undefined) record.location = input.location;
  if (input.postingUrl !== undefined) record.postingUrl = input.postingUrl;
  if (input.source !== undefined) record.source = input.source;
  if (input.contactName !== undefined) record.contactName = input.contactName;
  if (input.contactEmail !== undefined) record.contactEmail = input.contactEmail;
  if (input.phone !== undefined) record.phone = input.phone;
  if (input.notes !== undefined) record.notes = input.notes;
  if (input.dateApplied !== undefined) record.dateApplied = parseDateInput(input.dateApplied);
  if (input.status !== undefined) record.status = input.status;
  if (input.status && input.status !== previousStatus) {
    record.timeline.push(statusEvent(input.status, record.organization));
  }
  await record.save();
  return serializeApplication(record);
}

export async function addApplicationComment(
  record: ApplicationDocument,
  author: { id: string; fullName: string; role: UserRole },
  body: string,
) {
  record.comments.push({
    authorId: author.id,
    author: author.fullName,
    authorInitials: initialsFromName(author.fullName),
    authorRole: author.role,
    body,
    createdAt: new Date(),
  });
  record.timeline.push({
    title: "Comment added",
    description: `${author.fullName} commented on this application`,
    timestamp: new Date(),
    icon: "forum",
    tone: "secondary",
  });
  await record.save();
  return serializeApplication(record);
}

type CommentMutationResult =
  | { error: "not_found" | "forbidden" }
  | { application: JobApplication };

export async function updateApplicationComment(
  record: ApplicationDocument,
  commentId: string,
  userId: string,
  body: string,
): Promise<CommentMutationResult> {
  const comment = record.comments.find((item) => asId(item) === commentId);
  if (!comment) return { error: "not_found" };
  if (!comment.authorId || asId(comment.authorId) !== userId) return { error: "forbidden" };
  comment.body = body;
  record.timeline.push({
    title: "Comment updated",
    description: `${comment.author} updated a comment`,
    timestamp: new Date(),
    icon: "forum",
    tone: "secondary",
  });
  await record.save();
  return { application: serializeApplication(record) };
}

export async function removeApplicationComment(
  record: ApplicationDocument,
  commentId: string,
  userId: string,
): Promise<CommentMutationResult> {
  const comment = record.comments.find((item) => asId(item) === commentId);
  if (!comment) return { error: "not_found" };
  if (!comment.authorId || asId(comment.authorId) !== userId) return { error: "forbidden" };
  if ("deleteOne" in comment && typeof comment.deleteOne === "function") {
    comment.deleteOne();
  } else {
    record.comments = record.comments.filter((item) => asId(item) !== commentId);
  }
  record.timeline.push({
    title: "Comment removed",
    description: `${comment.author} removed a comment`,
    timestamp: new Date(),
    icon: "forum",
    tone: "neutral",
  });
  await record.save();
  return { application: serializeApplication(record) };
}

export async function attachApplicationFile(
  record: ApplicationDocument,
  input: {
    kind: DocumentUploadKind;
    name: string;
    sizeLabel: string;
    url: string;
    publicId: string;
    resourceType: string;
  },
) {
  const existing = record.documents.find((item) => item.kind === input.kind);
  if (existing) {
    existing.name = input.name;
    existing.sizeLabel = input.sizeLabel;
    existing.url = input.url;
    existing.publicId = input.publicId;
    existing.resourceType = input.resourceType;
    existing.uploadedAt = new Date();
  } else {
    record.documents.push({
      kind: input.kind,
      name: input.name,
      sizeLabel: input.sizeLabel,
      url: input.url,
      publicId: input.publicId,
      resourceType: input.resourceType,
      uploadedAt: new Date(),
    });
  }
  record.timeline.push({
    title: `${DOCUMENT_KIND_LABELS[input.kind]} uploaded`,
    description: input.name,
    timestamp: new Date(),
    icon: "upload_file",
    tone: "primary",
  });
  await record.save();
  return serializeApplication(record);
}

export async function removeApplicationFile(record: ApplicationDocument, documentId: string) {
  const document = record.documents.find((item) => asId(item) === documentId);
  if (!document) return null;
  const publicId = document.publicId;
  const resourceType = document.resourceType || "raw";
  if ("deleteOne" in document && typeof document.deleteOne === "function") {
    document.deleteOne();
  } else {
    record.documents = record.documents.filter((item) => asId(item) !== documentId);
  }
  await record.save();
  return { application: serializeApplication(record), publicId, resourceType };
}

export async function deleteApplication(record: ApplicationDocument) {
  await record.deleteOne();
}

export function recentUpdatesFrom(applications: JobApplication[], limit = 3) {
  return applications
    .flatMap((application) =>
      application.timeline.map((event) => ({
        ...event,
        organization: application.organization,
        applicationId: application.id,
      })),
    )
    .slice(0, limit);
}
