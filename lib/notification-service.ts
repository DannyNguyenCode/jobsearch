import { dbConnect } from "@/lib/db";
import { Notification, type NotificationDocument } from "@/lib/models/Notification";
import { User } from "@/lib/models/User";
import { formatDisplayDateTime } from "@/lib/dates";
import { isObjectId } from "@/lib/object-id";
import {
  isNotificationKind,
  type AppNotification,
  type NotificationKind,
} from "@/lib/notifications";

function asId(value: unknown) {
  if (value && typeof value === "object" && "_id" in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value ?? "");
}

export function serializeNotification(notification: NotificationDocument): AppNotification {
  return {
    id: String(notification._id),
    kind: isNotificationKind(notification.kind) ? notification.kind : "application_updated",
    title: notification.actorName,
    body: notification.body,
    href: notification.href ?? "",
    read: Boolean(notification.readAt),
    createdAt: notification.createdAt ? formatDisplayDateTime(notification.createdAt) : "",
  };
}

export async function createNotification(input: {
  recipientId: string;
  actorName: string;
  kind: NotificationKind;
  body: string;
  href?: string;
  applicantId?: string;
  applicationId?: string;
}) {
  if (!isObjectId(input.recipientId) || input.recipientId === "") return null;
  await dbConnect();
  const created = await Notification.create({
    recipientId: input.recipientId,
    actorName: input.actorName,
    kind: input.kind,
    body: input.body,
    href: input.href ?? "",
    applicantId: input.applicantId && isObjectId(input.applicantId) ? input.applicantId : null,
    applicationId: input.applicationId && isObjectId(input.applicationId) ? input.applicationId : null,
  });
  return serializeNotification(created);
}

export async function notifyLinkedRecruiter(
  applicantId: string,
  input: {
    kind: NotificationKind;
    body: string;
    href: string;
    applicationId?: string;
  },
) {
  if (!isObjectId(applicantId)) return null;
  await dbConnect();
  const applicant = await User.findById(applicantId).select("fullName referenceCode");
  if (!applicant?.referenceCode) return null;
  const recruiter = await User.findOne({
    role: "recruiter",
    referenceCode: applicant.referenceCode,
  }).select("_id");
  if (!recruiter) return null;
  return createNotification({
    recipientId: String(recruiter._id),
    actorName: applicant.fullName,
    kind: input.kind,
    body: input.body,
    href: input.href,
    applicantId,
    applicationId: input.applicationId,
  });
}

export async function listNotificationsForUser(recipientId: string, limit = 30) {
  if (!isObjectId(recipientId)) return { notifications: [], unreadCount: 0 };
  await dbConnect();
  const [rows, unreadCount] = await Promise.all([
    Notification.find({ recipientId }).sort({ createdAt: -1 }).limit(limit),
    Notification.countDocuments({ recipientId, readAt: null }),
  ]);
  return {
    notifications: rows.map(serializeNotification),
    unreadCount,
  };
}

export async function markNotificationRead(recipientId: string, notificationId: string) {
  if (!isObjectId(recipientId) || !isObjectId(notificationId)) return null;
  await dbConnect();
  const notification = await Notification.findOne({ _id: notificationId, recipientId });
  if (!notification) return null;
  if (!notification.readAt) {
    notification.readAt = new Date();
    await notification.save();
  }
  return serializeNotification(notification);
}

export async function markAllNotificationsRead(recipientId: string) {
  if (!isObjectId(recipientId)) return 0;
  await dbConnect();
  const result = await Notification.updateMany(
    { recipientId, readAt: null },
    { $set: { readAt: new Date() } },
  );
  return result.modifiedCount;
}
