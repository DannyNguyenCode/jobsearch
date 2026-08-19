/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readResponse } from "../helpers";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth: (...args: unknown[]) => auth(...args) }));

vi.mock("@/lib/application-service", () => ({
  attachApplicationFile: vi.fn(),
  loadApplicationForApplicant: vi.fn(),
  loadApplicationForViewer: vi.fn(),
  removeApplicationFile: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
}));

vi.mock("@/lib/cloudinary", () => ({
  uploadApplicationAsset: vi.fn(),
  destroyApplicationAsset: vi.fn(),
}));

import { POST } from "@/app/api/applications/[id]/documents/route";
import { DELETE } from "@/app/api/applications/[id]/documents/[docId]/route";
import { GET as getApplication } from "@/app/api/applications/[id]/route";
import {
  attachApplicationFile,
  loadApplicationForApplicant,
  loadApplicationForViewer,
  removeApplicationFile,
} from "@/lib/application-service";
import { destroyApplicationAsset, uploadApplicationAsset } from "@/lib/cloudinary";

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

function fileRequest(kind: string, file?: File) {
  const form = new FormData();
  form.append("kind", kind);
  if (file) form.append("file", file);
  return new Request("http://localhost/api/applications/cccccccccccccccccccccccc/documents", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/applications/[id]/documents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: applicant });
  });

  it("uploads a resume under the jobtrackerhub folder", async () => {
    const record = {
      position: "Customer Service",
      dateApplied: new Date(2026, 7, 18),
      documents: [],
    };
    vi.mocked(loadApplicationForApplicant).mockResolvedValue({
      applicant: { name: "Alex Johnson" },
      record,
    } as never);
    vi.mocked(uploadApplicationAsset).mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/resume.pdf",
      public_id: "jobtrackerhub/alex-johnson/customerservice-18-08-2026/resume",
      resource_type: "raw",
      bytes: 1200,
    });
    vi.mocked(attachApplicationFile).mockResolvedValue({
      id: "cccccccccccccccccccccccc",
      documents: [{ kind: "resume", name: "resume.pdf" }],
    } as never);

    const { status, body } = await readResponse(
      await POST(fileRequest("resume", new File(["pdf"], "resume.pdf", { type: "application/pdf" })), { params }),
    );

    expect(status).toBe(201);
    expect(uploadApplicationAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: "jobtrackerhub/alex-johnson/customerservice-18-08-2026",
        publicId: "resume",
        filename: "resume.pdf",
      }),
    );
    expect(attachApplicationFile).toHaveBeenCalledWith(
      record,
      expect.objectContaining({
        kind: "resume",
        name: "resume.pdf",
        url: "https://res.cloudinary.com/demo/resume.pdf",
        publicId: "jobtrackerhub/alex-johnson/customerservice-18-08-2026/resume",
      }),
    );
    expect(body.application).toMatchObject({ documents: [expect.objectContaining({ kind: "resume" })] });
  });

  it("uploads a job description with the job-description public id", async () => {
    const record = {
      position: "Frontend Engineer",
      dateApplied: new Date(2026, 7, 18),
      documents: [],
    };
    vi.mocked(loadApplicationForApplicant).mockResolvedValue({
      applicant: { name: "Danny Nguyen" },
      record,
    } as never);
    vi.mocked(uploadApplicationAsset).mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/job.pdf",
      public_id: "jobtrackerhub/danny-nguyen/frontendengineer-18-08-2026/job-description",
      resource_type: "raw",
      bytes: 800,
    });
    vi.mocked(attachApplicationFile).mockResolvedValue({ documents: [] } as never);

    const { status } = await readResponse(
      await POST(
        fileRequest("jobPosting", new File(["desc"], "posting.pdf", { type: "application/pdf" })),
        { params },
      ),
    );

    expect(status).toBe(201);
    expect(uploadApplicationAsset).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: "jobtrackerhub/danny-nguyen/frontendengineer-18-08-2026",
        publicId: "job-description",
      }),
    );
  });

  it("replaces an existing resume", async () => {
    const record = {
      position: "Customer Service",
      dateApplied: new Date(2026, 7, 18),
      documents: [
        {
          kind: "resume",
          publicId: "jobtrackerhub/alex-johnson/customerservice-18-08-2026/old-resume",
          resourceType: "raw",
        },
      ],
    };
    vi.mocked(loadApplicationForApplicant).mockResolvedValue({
      applicant: { name: "Alex Johnson" },
      record,
    } as never);
    vi.mocked(uploadApplicationAsset).mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/resume-v2.pdf",
      public_id: "jobtrackerhub/alex-johnson/customerservice-18-08-2026/resume",
      resource_type: "raw",
      bytes: 2400,
    });
    vi.mocked(attachApplicationFile).mockResolvedValue({
      documents: [{ kind: "resume", name: "resume-v2.pdf", url: "https://res.cloudinary.com/demo/resume-v2.pdf" }],
    } as never);

    const { status, body } = await readResponse(
      await POST(
        fileRequest("resume", new File(["pdf-v2"], "resume-v2.pdf", { type: "application/pdf" })),
        { params },
      ),
    );

    expect(status).toBe(201);
    expect(attachApplicationFile).toHaveBeenCalledWith(
      record,
      expect.objectContaining({ kind: "resume", name: "resume-v2.pdf" }),
    );
    expect(destroyApplicationAsset).toHaveBeenCalledWith(
      "jobtrackerhub/alex-johnson/customerservice-18-08-2026/old-resume",
      "raw",
    );
    expect(body.application).toMatchObject({
      documents: [expect.objectContaining({ name: "resume-v2.pdf" })],
    });
  });

  it("rejects recruiter uploads", async () => {
    auth.mockResolvedValue({ user: recruiter });
    const { status, body } = await readResponse(
      await POST(fileRequest("resume", new File(["pdf"], "resume.pdf", { type: "application/pdf" })), { params }),
    );
    expect(status).toBe(403);
    expect(String(body.error)).toMatch(/cannot add, update, archive, or delete/i);
    expect(uploadApplicationAsset).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/applications/[id]/documents/[docId]", () => {
  const deleteParams = Promise.resolve({ id: "cccccccccccccccccccccccc", docId: "dddddddddddddddddddddddd" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes a document for the applicant", async () => {
    const record = { documents: [] };
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForApplicant).mockResolvedValue({ record } as never);
    vi.mocked(removeApplicationFile).mockResolvedValue({
      application: { documents: [] },
      publicId: "jobtrackerhub/danny-nguyen/role-18-08-2026/resume",
      resourceType: "raw",
    } as never);

    const { status } = await readResponse(
      await DELETE(new Request("http://localhost/api", { method: "DELETE" }), { params: deleteParams }),
    );

    expect(status).toBe(200);
    expect(removeApplicationFile).toHaveBeenCalledWith(record, "dddddddddddddddddddddddd");
    expect(destroyApplicationAsset).toHaveBeenCalledWith(
      "jobtrackerhub/danny-nguyen/role-18-08-2026/resume",
      "raw",
    );
  });

  it("rejects recruiter deletes", async () => {
    auth.mockResolvedValue({ user: recruiter });
    const { status } = await readResponse(
      await DELETE(new Request("http://localhost/api", { method: "DELETE" }), { params: deleteParams }),
    );
    expect(status).toBe(403);
    expect(removeApplicationFile).not.toHaveBeenCalled();
  });
});

describe("viewing and downloading documents", () => {
  it("returns document urls so the applicant can view and download files", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({
      application: {
        id: "cccccccccccccccccccccccc",
        documents: [
          {
            id: "dddddddddddddddddddddddd",
            kind: "resume",
            name: "resume.pdf",
            url: "https://res.cloudinary.com/demo/resume.pdf",
          },
        ],
      },
      applicant: { id: applicant.id, name: "Danny Nguyen" },
    } as never);

    const { status, body } = await readResponse(
      await getApplication(new Request("http://localhost/api/applications/cccccccccccccccccccccccc"), { params }),
    );

    expect(status).toBe(200);
    expect(body.application).toMatchObject({
      documents: [expect.objectContaining({ name: "resume.pdf", url: "https://res.cloudinary.com/demo/resume.pdf" })],
    });
  });

  it("lets a linked recruiter view and download documents without changing them", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({
      application: {
        documents: [
          {
            kind: "jobPosting",
            name: "posting.pdf",
            url: "https://res.cloudinary.com/demo/posting.pdf",
          },
        ],
      },
      applicant: { id: applicant.id },
    } as never);

    const { status, body } = await readResponse(
      await getApplication(new Request("http://localhost/api/applications/cccccccccccccccccccccccc"), { params }),
    );

    expect(status).toBe(200);
    expect(body.application).toMatchObject({
      documents: [expect.objectContaining({ url: "https://res.cloudinary.com/demo/posting.pdf" })],
    });
  });
});
