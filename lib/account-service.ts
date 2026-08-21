import { dbConnect } from "@/lib/db";
import { destroyApplicationAsset } from "@/lib/cloudinary";
import { Application } from "@/lib/models/Application";
import { Notification } from "@/lib/models/Notification";
import { User } from "@/lib/models/User";
import { notifyLinkedRecruiter } from "@/lib/notification-service";
import { accountDeletedLine } from "@/lib/notifications";
import { isObjectId } from "@/lib/object-id";

export const UNKNOWN_COMMENT_AUTHOR = "Unknown user";
export const UNKNOWN_COMMENT_INITIALS = "?";

function asId(value: unknown) {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value ?? "");
}

export async function deleteApplicantAccount(userId: string) {
  if (!isObjectId(userId)) return null;
  await dbConnect();
  const applicant = await User.findOne({ _id: userId, role: "applicant" });
  if (!applicant) return null;

  await notifyLinkedRecruiter(userId, {
    kind: "relationship_ended",
    body: accountDeletedLine(),
    href: "/recruiter/applicants",
  });

  const applications = await Application.find({ applicantId: userId }).select("documents");
  const applicationIds = applications.map((application) => application._id);
  await Promise.allSettled(
    applications.flatMap((application) =>
      application.documents
        .filter((document) => document.publicId)
        .map((document) => destroyApplicationAsset(document.publicId, document.resourceType || "raw")),
    ),
  );

  await Application.deleteMany({ applicantId: userId });
  await Notification.deleteMany({
    $or: [{ recipientId: userId }, { applicantId: userId }, { applicationId: { $in: applicationIds } }],
  });
  await User.deleteOne({ _id: userId, role: "applicant" });

  return { id: asId(applicant._id) };
}

export async function deleteRecruiterAccount(userId: string) {
  if (!isObjectId(userId)) return null;
  await dbConnect();
  const recruiter = await User.findOne({ _id: userId, role: "recruiter" });
  if (!recruiter) return null;

  if (recruiter.referenceCode) {
    await User.updateMany(
      { role: "applicant", referenceCode: recruiter.referenceCode },
      { $set: { referenceCode: "" } },
    );
  }

  await Application.updateMany(
    { "comments.authorId": recruiter._id },
    {
      $set: {
        "comments.$[comment].author": UNKNOWN_COMMENT_AUTHOR,
        "comments.$[comment].authorInitials": UNKNOWN_COMMENT_INITIALS,
        "comments.$[comment].authorId": null,
      },
    },
    { arrayFilters: [{ "comment.authorId": recruiter._id }] },
  );

  await Notification.deleteMany({ recipientId: userId });
  await User.deleteOne({ _id: userId, role: "recruiter" });

  return { id: asId(recruiter._id) };
}
