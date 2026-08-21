/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, readResponse } from "../helpers";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth: (...args: unknown[]) => auth(...args) }));

vi.mock("@/lib/notification-service", () => ({
  listNotificationsForUser: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
}));

import { GET, PATCH } from "@/app/api/notifications/route";
import { PATCH as markOne } from "@/app/api/notifications/[id]/route";
import {
  listNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notification-service";

const recruiter = {
  id: "bbbbbbbbbbbbbbbbbbbbbbbb",
  role: "recruiter" as const,
  fullName: "Alex Rivers",
};

const sample = {
  id: "cccccccccccccccccccccccc",
  kind: "application_comment",
  title: "Danny Nguyen",
  body: "Comment added",
  href: "/recruiter/applicants/aaaaaaaaaaaaaaaaaaaaaaaa/applications/dddddddddddddddddddddddd",
  read: false,
  createdAt: "Aug 20, 2026, 12:00 PM",
};

describe("GET /api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the signed-in user's notifications", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(listNotificationsForUser).mockResolvedValue({
      notifications: [sample],
      unreadCount: 1,
    });

    const { status, body } = await readResponse(await GET());

    expect(status).toBe(200);
    expect(body.notifications).toEqual([sample]);
    expect(body.unreadCount).toBe(1);
    expect(listNotificationsForUser).toHaveBeenCalledWith(recruiter.id);
  });

  it("requires a signed-in user", async () => {
    auth.mockResolvedValue(null);
    const { status } = await readResponse(await GET());
    expect(status).toBe(401);
  });
});

describe("PATCH /api/notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks every notification as read", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(markAllNotificationsRead).mockResolvedValue(3);

    const { status, body } = await readResponse(
      await PATCH(jsonRequest({})),
    );

    expect(status).toBe(200);
    expect(body.updated).toBe(3);
  });
});

describe("PATCH /api/notifications/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks one notification as read", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(markNotificationRead).mockResolvedValue({ ...sample, read: true });

    const { status, body } = await readResponse(
      await markOne(jsonRequest({}), { params: Promise.resolve({ id: sample.id }) }),
    );

    expect(status).toBe(200);
    expect((body.notification as { read: boolean }).read).toBe(true);
    expect(markNotificationRead).toHaveBeenCalledWith(recruiter.id, sample.id);
  });
});
