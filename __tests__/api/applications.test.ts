/** @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, readResponse } from "../helpers";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth: (...args: unknown[]) => auth(...args) }));

vi.mock("@/lib/application-service", () => ({
  createApplication: vi.fn(),
  listApplicationsForApplicant: vi.fn(),
  listApplicationsForRecruiter: vi.fn(),
  loadApplicationForViewer: vi.fn(),
  loadApplicationForApplicant: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
}));

vi.mock("@/lib/cloudinary", () => ({
  destroyApplicationAsset: vi.fn(),
}));

import { GET, POST } from "@/app/api/applications/route";
import { GET as getOne, PATCH, DELETE } from "@/app/api/applications/[id]/route";
import {
  createApplication,
  deleteApplication,
  listApplicationsForApplicant,
  listApplicationsForRecruiter,
  loadApplicationForApplicant,
  loadApplicationForViewer,
  updateApplication,
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

const sample = {
  id: "cccccccccccccccccccccccc",
  position: "Frontend Engineer",
  organization: "TechCorp",
  status: "applied",
  applicantId: applicant.id,
  comments: [
    {
      id: "dddddddddddddddddddddddd",
      authorId: applicant.id,
      author: "Danny Nguyen",
      body: "I submitted the application.",
    },
  ],
  documents: [
    {
      id: "eeeeeeeeeeeeeeeeeeeeeeee",
      kind: "resume",
      name: "resume.pdf",
      url: "https://res.cloudinary.com/demo/resume.pdf",
    },
  ],
};

describe("GET /api/applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires sign-in", async () => {
    auth.mockResolvedValue(null);
    const { status } = await readResponse(await GET(jsonRequest({})));
    expect(status).toBe(401);
  });

  it("lists an applicant's active applications", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(listApplicationsForApplicant).mockResolvedValue([sample] as never);

    const { status, body } = await readResponse(await GET(new Request("http://localhost/api/applications")));

    expect(status).toBe(200);
    expect(body.applications).toEqual([sample]);
    expect(listApplicationsForApplicant).toHaveBeenCalledWith(applicant.id, "active");
  });

  it("lists applications for a recruiter's linked applicants", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(listApplicationsForRecruiter).mockResolvedValue([sample] as never);

    const { status } = await readResponse(await GET(new Request("http://localhost/api/applications")));
    expect(status).toBe(200);
    expect(listApplicationsForRecruiter).toHaveBeenCalledWith(recruiter.referenceCode, "active");
  });

  it("lists archived applications for the applicant", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(listApplicationsForApplicant).mockResolvedValue([{ ...sample, status: "archived" }] as never);

    const { status, body } = await readResponse(
      await GET(new Request("http://localhost/api/applications?view=archive")),
    );

    expect(status).toBe(200);
    expect(listApplicationsForApplicant).toHaveBeenCalledWith(applicant.id, "archive");
    expect(body.applications).toEqual([expect.objectContaining({ status: "archived" })]);
  });
});

describe("POST /api/applications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(createApplication).mockResolvedValue(sample as never);
  });

  it("creates an application for the signed-in applicant", async () => {
    const { status, body } = await readResponse(
      await POST(
        jsonRequest({
          position: "Frontend Engineer",
          organization: "TechCorp",
          source: "jobBoard",
          dateApplied: "2026-08-18",
        }),
      ),
    );

    expect(status).toBe(201);
    expect(body.application).toEqual(sample);
    expect(createApplication).toHaveBeenCalledWith(
      applicant.id,
      expect.objectContaining({
        position: "Frontend Engineer",
        organization: "TechCorp",
        source: "jobBoard",
      }),
    );
  });

  it("rejects recruiter creates", async () => {
    auth.mockResolvedValue({ user: recruiter });
    const { status } = await readResponse(
      await POST(jsonRequest({ position: "Role", organization: "Org", source: "other" })),
    );
    expect(status).toBe(403);
    expect(createApplication).not.toHaveBeenCalled();
  });
});

describe("PATCH /api/applications/[id]", () => {
  const params = Promise.resolve({ id: sample.id });

  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ user: applicant });
  });

  it("updates job details for the applicant", async () => {
    const record = { id: sample.id };
    vi.mocked(loadApplicationForApplicant).mockResolvedValue({
      application: sample,
      applicant: { id: applicant.id },
      record,
    } as never);
    vi.mocked(updateApplication).mockResolvedValue({
      ...sample,
      position: "Staff Engineer",
      organization: "Northwind",
    } as never);

    const { status, body } = await readResponse(
      await PATCH(jsonRequest({ position: "Staff Engineer", organization: "Northwind" }), { params }),
    );

    expect(status).toBe(200);
    expect(updateApplication).toHaveBeenCalledWith(record, {
      position: "Staff Engineer",
      organization: "Northwind",
    });
    expect(body.application).toMatchObject({ position: "Staff Engineer", organization: "Northwind" });
  });

  it("archives an application", async () => {
    const record = { id: sample.id };
    vi.mocked(loadApplicationForApplicant).mockResolvedValue({
      application: sample,
      applicant: { id: applicant.id },
      record,
    } as never);
    vi.mocked(updateApplication).mockResolvedValue({ ...sample, status: "archived" } as never);

    const { status, body } = await readResponse(
      await PATCH(jsonRequest({ status: "archived" }), { params }),
    );

    expect(status).toBe(200);
    expect(updateApplication).toHaveBeenCalledWith(record, { status: "archived" });
    expect(body.application).toMatchObject({ status: "archived" });
  });

  it("rejects recruiter updates, archives, and deletes", async () => {
    auth.mockResolvedValue({ user: recruiter });
    const { status, body } = await readResponse(await PATCH(jsonRequest({ status: "archived" }), { params }));
    expect(status).toBe(403);
    expect(body.error).toMatch(/cannot add, update, archive, or delete/i);
    expect(loadApplicationForApplicant).not.toHaveBeenCalled();
    expect(updateApplication).not.toHaveBeenCalled();
  });

  it("returns 404 when the application is missing", async () => {
    vi.mocked(loadApplicationForApplicant).mockResolvedValue(null);
    const { status } = await readResponse(await PATCH(jsonRequest({ status: "interview" }), { params }));
    expect(status).toBe(404);
  });
});

describe("GET /api/applications/[id]", () => {
  it("returns one application", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({
      application: sample,
      applicant: { id: applicant.id, name: "Danny Nguyen" },
    } as never);

    const { status, body } = await readResponse(
      await getOne(new Request("http://localhost/api/applications/cccccccccccccccccccccccc"), {
        params: Promise.resolve({ id: sample.id }),
      }),
    );

    expect(status).toBe(200);
    expect(body.application).toEqual(sample);
  });

  it("includes comments and downloadable documents when the applicant views an application", async () => {
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({
      application: sample,
      applicant: { id: applicant.id, name: "Danny Nguyen" },
    } as never);

    const { status, body } = await readResponse(
      await getOne(new Request("http://localhost/api/applications/cccccccccccccccccccccccc"), {
        params: Promise.resolve({ id: sample.id }),
      }),
    );

    expect(status).toBe(200);
    expect(body.application).toMatchObject({
      comments: [expect.objectContaining({ body: "I submitted the application." })],
      documents: [expect.objectContaining({ url: "https://res.cloudinary.com/demo/resume.pdf" })],
    });
  });

  it("lets a linked recruiter read an application", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({
      application: sample,
      applicant: { id: applicant.id, name: "Danny Nguyen" },
    } as never);

    const { status } = await readResponse(
      await getOne(new Request("http://localhost/api/applications/cccccccccccccccccccccccc"), {
        params: Promise.resolve({ id: sample.id }),
      }),
    );

    expect(status).toBe(200);
    expect(loadApplicationForViewer).toHaveBeenCalledWith(
      sample.id,
      expect.objectContaining({ id: recruiter.id, role: "recruiter" }),
    );
  });

  it("includes comments and document download urls for a linked recruiter", async () => {
    auth.mockResolvedValue({ user: recruiter });
    vi.mocked(loadApplicationForViewer).mockResolvedValue({
      application: sample,
      applicant: { id: applicant.id, name: "Danny Nguyen" },
    } as never);

    const { status, body } = await readResponse(
      await getOne(new Request("http://localhost/api/applications/cccccccccccccccccccccccc"), {
        params: Promise.resolve({ id: sample.id }),
      }),
    );

    expect(status).toBe(200);
    expect(body.application).toMatchObject({
      comments: [expect.objectContaining({ author: "Danny Nguyen" })],
      documents: [expect.objectContaining({ name: "resume.pdf", url: "https://res.cloudinary.com/demo/resume.pdf" })],
    });
  });
});

describe("DELETE /api/applications/[id]", () => {
  const params = Promise.resolve({ id: sample.id });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permanently deletes an applicant's application", async () => {
    const record = { id: sample.id };
    auth.mockResolvedValue({ user: applicant });
    vi.mocked(loadApplicationForApplicant).mockResolvedValue({
      application: sample,
      applicant: { id: applicant.id },
      record,
    } as never);

    const { status, body } = await readResponse(
      await DELETE(new Request("http://localhost/api/applications/cccccccccccccccccccccccc", { method: "DELETE" }), {
        params,
      }),
    );

    expect(status).toBe(200);
    expect(body.deleted).toBe(true);
    expect(deleteApplication).toHaveBeenCalledWith(record);
  });

  it("rejects recruiter deletes", async () => {
    auth.mockResolvedValue({ user: recruiter });
    const { status } = await readResponse(
      await DELETE(new Request("http://localhost/api/applications/cccccccccccccccccccccccc", { method: "DELETE" }), {
        params,
      }),
    );
    expect(status).toBe(403);
    expect(deleteApplication).not.toHaveBeenCalled();
  });
});
