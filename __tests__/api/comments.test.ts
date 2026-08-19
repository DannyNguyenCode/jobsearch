/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, readResponse } from "../helpers";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth: (...args: unknown[]) => auth(...args) }));

vi.mock("@/lib/application-service", () => ({
  addApplicationComment: vi.fn(),
  loadApplicationForViewer: vi.fn(),
  updateApplicationComment: vi.fn(),
  removeApplicationComment: vi.fn(),
}));

import { GET, POST } from "@/app/api/applications/[id]/comments/route";
import { PATCH, DELETE } from "@/app/api/applications/[id]/comments/[commentId]/route";
import {
  addApplicationComment,
  loadApplicationForViewer,
  removeApplicationComment,
  updateApplicationComment,
} from "@/lib/application-service";

const applicant = {
  id: "aaaaaaaaaaaaaaaaaaaaaaaa",
  role: "applicant" as const,
  fullName: "Danny Nguyen",
  referenceCode: "",
};

const recruiter = {
  id: "bbbbbbbbbbbbbbbbbbbbbbbb",
  role: "recruiter" as const,
  fullName: "Alex Rivers",
  referenceCode: "REC-7K4P2M",
};

const params = Promise.resolve({ id: "cccccccccccccccccccccccc" });
const commentParams = Promise.resolve({
  id: "cccccccccccccccccccccccc",
  commentId: "dddddddddddddddddddddddd",
});

const ownComment = {
  id: "dddddddddddddddddddddddd",
  authorId: applicant.id,
  author: "Danny Nguyen",
  body: "I sent the follow-up.",
};

describe("GET /api/applications/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets the applicant view comments", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({
      application: { comments: [ownComment] },
    } as never);

    const { status, body } = await readResponse(
      await GET(new Request("http://localhost/api/applications/cccccccccccccccccccccccc/comments"), { params }),
    );

    expect(status).toBe(200);
    expect(body.comments).toEqual([ownComment]);
  });

  it("lets a linked recruiter view comments", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({
      application: { comments: [ownComment] },
    } as never);

    const { status, body } = await readResponse(
      await GET(new Request("http://localhost/api/applications/cccccccccccccccccccccccc/comments"), { params }),
    );

    expect(status).toBe(200);
    expect(body.comments).toEqual([ownComment]);
    expect(loadApplicationForViewer).toHaveBeenCalledWith(
      "cccccccccccccccccccccccc",
      expect.objectContaining({ id: recruiter.id, role: "recruiter" }),
    );
  });
});

describe("POST /api/applications/[id]/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets a recruiter comment on a linked application", async () => {
    const record = { id: "cccccccccccccccccccccccc" };
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record } as never);
    vi.mocked(addApplicationComment).mockResolvedValue({
      id: "cccccccccccccccccccccccc",
      comments: [{ body: "Prep for the screen.", author: "Alex Rivers" }],
    } as never);

    const { status, body } = await readResponse(
      await POST(jsonRequest({ body: "Prep for the screen." }), { params }),
    );

    expect(status).toBe(201);
    expect(addApplicationComment).toHaveBeenCalledWith(
      record,
      expect.objectContaining({ id: recruiter.id, role: "recruiter", fullName: "Alex Rivers" }),
      "Prep for the screen.",
    );
    expect(body.application).toMatchObject({ comments: [expect.objectContaining({ body: "Prep for the screen." })] });
  });

  it("lets the applicant comment on their application", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record: { id: "cccccccccccccccccccccccc" } } as never);
    vi.mocked(addApplicationComment).mockResolvedValue({ comments: [] } as never);

    const { status } = await readResponse(await POST(jsonRequest({ body: "Thanks for the feedback." }), { params }));
    expect(status).toBe(201);
    expect(addApplicationComment).toHaveBeenCalled();
  });

  it("rejects an empty comment", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record: { id: "cccccccccccccccccccccccc" } } as never);
    const { status } = await readResponse(await POST(jsonRequest({ body: "   " }), { params }));
    expect(status).toBe(400);
    expect(addApplicationComment).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/applications/[id]/comments/[commentId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets the applicant update their own comment", async () => {
    const record = { id: "cccccccccccccccccccccccc" };
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record } as never);
    vi.mocked(updateApplicationComment).mockResolvedValue({
      application: { comments: [{ ...ownComment, body: "Updated follow-up." }] },
    } as never);

    const { status, body } = await readResponse(
      await PATCH(jsonRequest({ body: "Updated follow-up." }), { params: commentParams }),
    );

    expect(status).toBe(200);
    expect(updateApplicationComment).toHaveBeenCalledWith(record, ownComment.id, applicant.id, "Updated follow-up.");
    expect(body.application).toMatchObject({ comments: [expect.objectContaining({ body: "Updated follow-up." })] });
  });

  it("lets a recruiter update their own comment", async () => {
    const record = { id: "cccccccccccccccccccccccc" };
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record } as never);
    vi.mocked(updateApplicationComment).mockResolvedValue({
      application: { comments: [{ body: "New coaching note." }] },
    } as never);

    const { status } = await readResponse(
      await PATCH(jsonRequest({ body: "New coaching note." }), { params: commentParams }),
    );

    expect(status).toBe(200);
    expect(updateApplicationComment).toHaveBeenCalledWith(record, ownComment.id, recruiter.id, "New coaching note.");
  });

  it("rejects updating someone else's comment", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record: { id: "cccccccccccccccccccccccc" } } as never);
    vi.mocked(updateApplicationComment).mockResolvedValue({ error: "forbidden" });

    const { status, body } = await readResponse(
      await PATCH(jsonRequest({ body: "Trying to edit theirs." }), { params: commentParams }),
    );

    expect(status).toBe(403);
    expect(String(body.error)).toMatch(/your own comments/i);
  });
});

describe("DELETE /api/applications/[id]/comments/[commentId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets the applicant delete their own comment", async () => {
    const record = { id: "cccccccccccccccccccccccc" };
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record } as never);
    vi.mocked(removeApplicationComment).mockResolvedValue({ application: { comments: [] } } as never);

    const { status, body } = await readResponse(
      await DELETE(new Request("http://localhost/api", { method: "DELETE" }), { params: commentParams }),
    );

    expect(status).toBe(200);
    expect(removeApplicationComment).toHaveBeenCalledWith(record, ownComment.id, applicant.id);
    expect(body.application).toMatchObject({ comments: [] });
  });

  it("lets a recruiter delete their own comment", async () => {
    const record = { id: "cccccccccccccccccccccccc" };
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record } as never);
    vi.mocked(removeApplicationComment).mockResolvedValue({ application: { comments: [] } } as never);

    const { status } = await readResponse(
      await DELETE(new Request("http://localhost/api", { method: "DELETE" }), { params: commentParams }),
    );

    expect(status).toBe(200);
    expect(removeApplicationComment).toHaveBeenCalledWith(record, ownComment.id, recruiter.id);
  });

  it("rejects deleting someone else's comment", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({ record: { id: "cccccccccccccccccccccccc" } } as never);
    vi.mocked(removeApplicationComment).mockResolvedValue({ error: "forbidden" });

    const { status, body } = await readResponse(
      await DELETE(new Request("http://localhost/api", { method: "DELETE" }), { params: commentParams }),
    );

    expect(status).toBe(403);
    expect(String(body.error)).toMatch(/your own comments/i);
  });
});
