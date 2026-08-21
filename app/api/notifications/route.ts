import { auth } from "@/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { listNotificationsForUser, markAllNotificationsRead } from "@/lib/notification-service";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to continue.", 401);

  const result = await listNotificationsForUser(session.user.id);
  return jsonOk(result);
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Sign in to continue.", 401);

  const updated = await markAllNotificationsRead(session.user.id);
  return jsonOk({ updated });
}
