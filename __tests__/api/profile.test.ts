/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, readResponse } from "../helpers";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth: (...args: unknown[]) => auth(...args) }));
vi.mock("@/lib/db", () => ({ dbConnect: vi.fn() }));

const { userFindById, userFindByIdAndUpdate } = vi.hoisted(() => ({
  userFindById: vi.fn(),
  userFindByIdAndUpdate: vi.fn(),
}));
vi.mock("@/lib/models/User", () => ({
  User: { findById: userFindById, findByIdAndUpdate: userFindByIdAndUpdate },
}));

vi.mock("@/lib/notification-service", () => ({
  notifyLinkedRecruiter: vi.fn(),
}));

import { GET, PATCH } from "@/app/api/account/profile/route";
import { notifyLinkedRecruiter } from "@/lib/notification-service";

const applicant = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  role: "applicant" as const,
  fullName: "Danny Nguyen",
};

describe("GET /api/account/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the applicant's saved contact details", async () => {
    auth.mockResolvedValue({ user: applicant });
    userFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        preferredName: "",
        phone: "555-0199",
        location: "Toronto, ON",
        openToRelocation: true,
        remotePreferred: false,
      }),
    });

    const { status, body } = await readResponse(await GET());

    expect(status).toBe(200);
    expect(body.profile).toEqual({
      preferredName: "",
      phone: "555-0199",
      location: "Toronto, ON",
      openToRelocation: true,
      remotePreferred: false,
    });
  });

  it("does not let a recruiter load applicant profile fields", async () => {
    auth.mockResolvedValue({ user: { id: "bbbbbbbbbbbbbbbbbbbbbbbb", role: "recruiter" } });
    const { status } = await readResponse(await GET());
    expect(status).toBe(401);
  });
});

describe("PATCH /api/account/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saves contact details and notifies the linked recruiter", async () => {
    auth.mockResolvedValue({ user: applicant });
    userFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        preferredName: "",
        phone: "",
        location: "",
        openToRelocation: false,
        remotePreferred: false,
      }),
    });
    userFindByIdAndUpdate.mockResolvedValue({
      preferredName: "Danny",
      phone: "555-0199",
      location: "Toronto, ON",
      openToRelocation: true,
      remotePreferred: false,
    });

    const { status, body } = await readResponse(
      await PATCH(
        jsonRequest({
          preferredName: "Danny",
          phone: "555-0199",
          location: "Toronto, ON",
          openToRelocation: true,
          remotePreferred: false,
        }),
      ),
    );

    expect(status).toBe(200);
    expect(userFindByIdAndUpdate).toHaveBeenCalledWith(
      applicant.id,
      {
        $set: {
          preferredName: "Danny",
          phone: "555-0199",
          location: "Toronto, ON",
          openToRelocation: true,
          remotePreferred: false,
        },
      },
      { new: true, runValidators: true },
    );
    expect(body.profile).toEqual({
      preferredName: "Danny",
      phone: "555-0199",
      location: "Toronto, ON",
      openToRelocation: true,
      remotePreferred: false,
    });
    expect(notifyLinkedRecruiter).toHaveBeenCalledWith(applicant.id, {
      kind: "contact_updated",
      body: "Updated their profile",
      href: `/recruiter/applicants/${applicant.id}`,
    });
  });

  it("persists job preference toggles on their own", async () => {
    auth.mockResolvedValue({ user: applicant });
    userFindById.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        preferredName: "Danny",
        phone: "555-0199",
        location: "Toronto, ON",
        openToRelocation: false,
        remotePreferred: false,
      }),
    });
    userFindByIdAndUpdate.mockResolvedValue({
      preferredName: "Danny",
      phone: "555-0199",
      location: "Toronto, ON",
      openToRelocation: true,
      remotePreferred: true,
    });

    const { status, body } = await readResponse(
      await PATCH(
        jsonRequest({
          preferredName: "Danny",
          phone: "555-0199",
          location: "Toronto, ON",
          openToRelocation: true,
          remotePreferred: true,
        }),
      ),
    );

    expect(status).toBe(200);
    expect(body.profile).toEqual({
      preferredName: "Danny",
      phone: "555-0199",
      location: "Toronto, ON",
      openToRelocation: true,
      remotePreferred: true,
    });
    expect(notifyLinkedRecruiter).toHaveBeenCalledWith(
      applicant.id,
      expect.objectContaining({ body: "Updated job preferences" }),
    );
  });
});
