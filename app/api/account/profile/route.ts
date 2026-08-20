import { auth } from "@/auth";
import { fieldErrors, jsonError, jsonOk, readJson } from "@/lib/api";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models/User";
import { notifyLinkedRecruiter } from "@/lib/notification-service";
import { contactUpdatedLine, recruiterApplicantHref } from "@/lib/notifications";
import { applicantProfileSchema } from "@/lib/validators/auth";

function profilePayload(user: {
  phone?: string | null;
  location?: string | null;
  openToRelocation?: boolean | null;
  remotePreferred?: boolean | null;
}) {
  return {
    phone: user.phone ?? "",
    location: user.location ?? "",
    openToRelocation: Boolean(user.openToRelocation),
    remotePreferred: Boolean(user.remotePreferred),
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "applicant") {
    return jsonError("Sign in as an applicant to view this profile.", 401);
  }

  await dbConnect();
  const user = await User.findById(session.user.id).select(
    "phone location openToRelocation remotePreferred",
  );
  if (!user) return jsonError("Profile not found.", 404);

  return jsonOk({ profile: profilePayload(user) });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "applicant") {
    return jsonError("Sign in as an applicant to update this profile.", 401);
  }

  const parsed = applicantProfileSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(fieldErrors(parsed.error));

  await dbConnect();
  const current = await User.findById(session.user.id).select(
    "phone location openToRelocation remotePreferred",
  );
  if (!current) return jsonError("Profile not found.", 404);

  const previous = profilePayload(current);
  const contactChanged =
    previous.phone !== parsed.data.phone || previous.location !== parsed.data.location;
  const preferencesChanged =
    previous.openToRelocation !== parsed.data.openToRelocation ||
    previous.remotePreferred !== parsed.data.remotePreferred;

  const user = await User.findByIdAndUpdate(
    session.user.id,
    {
      $set: {
        phone: parsed.data.phone,
        location: parsed.data.location,
        openToRelocation: parsed.data.openToRelocation,
        remotePreferred: parsed.data.remotePreferred,
      },
    },
    { new: true, runValidators: true },
  );
  if (!user) return jsonError("Profile not found.", 404);

  if (contactChanged || preferencesChanged) {
    await notifyLinkedRecruiter(session.user.id, {
      kind: "contact_updated",
      body: contactUpdatedLine({ contact: contactChanged, preferences: preferencesChanged }),
      href: recruiterApplicantHref(session.user.id),
    });
  }

  return jsonOk({ profile: profilePayload(user) });
}
