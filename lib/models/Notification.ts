import mongoose, { type HydratedDocument, type InferSchemaType, type Model } from "mongoose";
import { NOTIFICATION_KINDS, type NotificationKind } from "@/lib/notifications";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorName: { type: String, required: true, trim: true },
    kind: { type: String, required: true, enum: NOTIFICATION_KINDS },
    body: { type: String, required: true, trim: true },
    href: { type: String, default: "", trim: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application", default: null },
    readAt: { type: Date, default: null },
  },
  {
    collection: "notification",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
);

notificationSchema.index({ recipientId: 1, createdAt: -1 });

export type NotificationFields = InferSchemaType<typeof notificationSchema> & {
  kind: NotificationKind;
};

export type NotificationDocument = HydratedDocument<NotificationFields>;

export const Notification: Model<NotificationFields> =
  mongoose.models.Notification ?? mongoose.model<NotificationFields>("Notification", notificationSchema);
