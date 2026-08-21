/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ dbConnect: vi.fn() }));

const {
  applicationFind,
  applicationDeleteMany,
  applicationUpdateMany,
  notificationDeleteMany,
  userFindOne,
  userDeleteOne,
  userUpdateMany,
} = vi.hoisted(() => ({
  applicationFind: vi.fn(),
  applicationDeleteMany: vi.fn(),
  applicationUpdateMany: vi.fn(),
  notificationDeleteMany: vi.fn(),
  userFindOne: vi.fn(),
  userDeleteOne: vi.fn(),
  userUpdateMany: vi.fn(),
}));

vi.mock("@/lib/models/Application", () => ({
  Application: {
    find: applicationFind,
    deleteMany: applicationDeleteMany,
    updateMany: applicationUpdateMany,
  },
}));
vi.mock("@/lib/models/Notification", () => ({
  Notification: { deleteMany: notificationDeleteMany },
}));
vi.mock("@/lib/models/User", () => ({
  User: { findOne: userFindOne, deleteOne: userDeleteOne, updateMany: userUpdateMany },
}));
vi.mock("@/lib/notification-service", () => ({
  notifyLinkedRecruiter: vi.fn(),
}));
vi.mock("@/lib/cloudinary", () => ({
  destroyApplicationAsset: vi.fn(),
}));

import {
  deleteApplicantAccount,
  deleteRecruiterAccount,
  UNKNOWN_COMMENT_AUTHOR,
  UNKNOWN_COMMENT_INITIALS,
} from "@/lib/account-service";
import { destroyApplicationAsset } from "@/lib/cloudinary";
import { notifyLinkedRecruiter } from "@/lib/notification-service";

const applicantId = "aaaaaaaaaaaaaaaaaaaaaaaa";
const recruiterId = "bbbbbbbbbbbbbbbbbbbbbbbb";

describe("deleteApplicantAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    applicationFind.mockReturnValue({
      select: vi.fn().mockResolvedValue([
        {
          _id: "cccccccccccccccccccccccc",
          documents: [
            { publicId: "folder/resume", resourceType: "raw" },
            { publicId: "", resourceType: "raw" },
          ],
        },
      ]),
    });
    applicationDeleteMany.mockResolvedValue({ deletedCount: 1 });
    notificationDeleteMany.mockResolvedValue({ deletedCount: 2 });
    userDeleteOne.mockResolvedValue({ deletedCount: 1 });
  });

  it("cascades applications, recruiter-facing records, and the login user", async () => {
    userFindOne.mockResolvedValue({ _id: applicantId, role: "applicant" });

    const result = await deleteApplicantAccount(applicantId);

    expect(result).toEqual({ id: applicantId });
    expect(notifyLinkedRecruiter).toHaveBeenCalledWith(applicantId, {
      kind: "relationship_ended",
      body: "Deleted their account",
      href: "/recruiter/applicants",
    });
    expect(destroyApplicationAsset).toHaveBeenCalledWith("folder/resume", "raw");
    expect(applicationDeleteMany).toHaveBeenCalledWith({ applicantId });
    expect(notificationDeleteMany).toHaveBeenCalledWith({
      $or: [
        { recipientId: applicantId },
        { applicantId },
        { applicationId: { $in: ["cccccccccccccccccccccccc"] } },
      ],
    });
    expect(userDeleteOne).toHaveBeenCalledWith({ _id: applicantId, role: "applicant" });
  });

  it("does not delete a recruiter account", async () => {
    userFindOne.mockResolvedValue(null);

    expect(await deleteApplicantAccount(applicantId)).toBeNull();
    expect(applicationDeleteMany).not.toHaveBeenCalled();
    expect(userDeleteOne).not.toHaveBeenCalled();
  });
});

describe("deleteRecruiterAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userUpdateMany.mockResolvedValue({ modifiedCount: 2 });
    applicationUpdateMany.mockResolvedValue({ modifiedCount: 1 });
    notificationDeleteMany.mockResolvedValue({ deletedCount: 1 });
    userDeleteOne.mockResolvedValue({ deletedCount: 1 });
  });

  it("unlinks applicants, anonymizes comments, and deletes only the recruiter", async () => {
    userFindOne.mockResolvedValue({
      _id: recruiterId,
      role: "recruiter",
      referenceCode: "REC-7K4P2M",
    });

    const result = await deleteRecruiterAccount(recruiterId);

    expect(result).toEqual({ id: recruiterId });
    expect(userUpdateMany).toHaveBeenCalledWith(
      { role: "applicant", referenceCode: "REC-7K4P2M" },
      { $set: { referenceCode: "" } },
    );
    expect(applicationUpdateMany).toHaveBeenCalledWith(
      { "comments.authorId": recruiterId },
      {
        $set: {
          "comments.$[comment].author": UNKNOWN_COMMENT_AUTHOR,
          "comments.$[comment].authorInitials": UNKNOWN_COMMENT_INITIALS,
          "comments.$[comment].authorId": null,
        },
      },
      { arrayFilters: [{ "comment.authorId": recruiterId }] },
    );
    expect(applicationDeleteMany).not.toHaveBeenCalled();
    expect(notificationDeleteMany).toHaveBeenCalledWith({ recipientId: recruiterId });
    expect(userDeleteOne).toHaveBeenCalledWith({ _id: recruiterId, role: "recruiter" });
  });

  it("does not delete an applicant account", async () => {
    userFindOne.mockResolvedValue(null);

    expect(await deleteRecruiterAccount(recruiterId)).toBeNull();
    expect(userUpdateMany).not.toHaveBeenCalled();
    expect(userDeleteOne).not.toHaveBeenCalled();
  });
});
