import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { markNotificationRead } from "@/lib/notification-service";

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to continue.", 401);

  const { id } = await params;
  const notification = await markNotificationRead(session.user.id, id);
  if (!notification) return jsonError("Notification not found.", 404);

  return jsonOk({ notification });
}
