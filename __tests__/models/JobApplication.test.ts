/** @vitest-environment node */
import mongoose from "mongoose";
import { describe, expect, it } from "vitest";
import { APPLICATION_ID_PATTERN } from "@/lib/application-id";
import { JobApplication, type JobApplicationDocument } from "@/lib/models/JobApplication";

const resume = {
  url: "https://res.cloudinary.com/demo/raw/upload/resume.pdf",
  publicId: "jobtrackerhub/alex-johnson/claims-18-08-2026/resume",
  originalFilename: "resume.pdf",
};

function validFields(overrides: Record<string, unknown> = {}) {
  return {
    applicantId: new mongoose.Types.ObjectId(),
    employer: "Intact Insurance",
    jobTitle: "Claims Customer Service Representative",
    dateApplied: new Date("2026-08-18T12:00:00.000Z"),
    location: "Mississauga, ON",
    workArrangement: "HYBRID",
    source: "INDEED",
    jobPostingUrl: "https://careers.intact.ca/jobs/claims",
    contactName: "Jane Smith",
    contactEmail: "Jane@Example.com",
    contactPhone: "+1 416 555 0100 ext. 12",
    applicantNotes: "Applied through Indeed.",
    ...overrides,
  };
}

async function makeApplication(overrides: Record<string, unknown> = {}) {
  const application = new JobApplication(validFields(overrides)) as JobApplicationDocument;
  await application.validate();
  return application;
}

async function validationError(overrides: Record<string, unknown>) {
  const application = new JobApplication(validFields(overrides));
  return application.validate().catch((error: unknown) => error);
}

describe("JobApplication model", () => {
  it("accepts a valid job application", async () => {
    const application = await makeApplication();
    expect(application.employer).toBe("Intact Insurance");
    expect(application.jobTitle).toBe("Claims Customer Service Representative");
    expect(application.applicantId).toBeInstanceOf(mongoose.Types.ObjectId);
  });

  it("requires applicantId", async () => {
    const error = await validationError({ applicantId: undefined });
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect((error as mongoose.Error.ValidationError).errors).toHaveProperty("applicantId");
  });

  it("requires employer", async () => {
    const error = await validationError({ employer: "  " });
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect((error as mongoose.Error.ValidationError).errors).toHaveProperty("employer");
  });

  it("requires jobTitle", async () => {
    const error = await validationError({ jobTitle: "" });
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect((error as mongoose.Error.ValidationError).errors).toHaveProperty("jobTitle");
  });

  it("accepts a valid status", async () => {
    const application = await makeApplication({ status: "INTERVIEW" });
    expect(application.status).toBe("INTERVIEW");
  });

  it("rejects an invalid status", async () => {
    const error = await validationError({ status: "ARCHIVED" });
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect((error as mongoose.Error.ValidationError).errors).toHaveProperty("status");
  });

  it("defaults status to APPLIED", async () => {
    const application = await makeApplication();
    expect(application.status).toBe("APPLIED");
  });

  it("accepts a valid work arrangement", async () => {
    const application = await makeApplication({ workArrangement: "REMOTE" });
    expect(application.workArrangement).toBe("REMOTE");
  });

  it("rejects an invalid work arrangement", async () => {
    const error = await validationError({ workArrangement: "remote" });
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect((error as mongoose.Error.ValidationError).errors).toHaveProperty("workArrangement");
  });

  it("accepts a valid source", async () => {
    const application = await makeApplication({ source: "LINKEDIN" });
    expect(application.source).toBe("LINKEDIN");
  });

  it("rejects an invalid source", async () => {
    const error = await validationError({ source: "jobBoard" });
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect((error as mongoose.Error.ValidationError).errors).toHaveProperty("source");
  });

  it("stores Cloudinary document metadata", async () => {
    const application = await makeApplication({
      resume,
      coverLetter: {
        url: "https://res.cloudinary.com/demo/raw/upload/cover-letter.pdf",
        publicId: "jobtrackerhub/alex-johnson/claims-18-08-2026/cover-letter",
        originalFilename: "cover-letter.pdf",
      },
      jobDescription: {
        url: "https://res.cloudinary.com/demo/raw/upload/job-posting.pdf",
        publicId: "jobtrackerhub/alex-johnson/claims-18-08-2026/job-description",
        originalFilename: "job-posting.pdf",
      },
    });

    expect(application.resume).toMatchObject(resume);
    expect(application.coverLetter?.originalFilename).toBe("cover-letter.pdf");
    expect(application.jobDescription?.publicId).toContain("job-description");
  });

  it("allows applications without documents", async () => {
    const application = await makeApplication();
    expect(application.resume).toBeUndefined();
    expect(application.coverLetter).toBeUndefined();
    expect(application.jobDescription).toBeUndefined();
  });

  it("defaults archivedAt to null", async () => {
    const application = await makeApplication();
    expect(application.archivedAt).toBeNull();
  });

  it("keeps the original status when archived", async () => {
    const archivedAt = new Date("2026-08-18T15:00:00.000Z");
    const application = await makeApplication({ status: "REJECTED", archivedAt });
    expect(application.status).toBe("REJECTED");
    expect(application.archivedAt).toEqual(archivedAt);
  });

  it("generates a unique applicationId", async () => {
    const first = await makeApplication();
    const second = await makeApplication();
    expect(first.applicationId).toMatch(APPLICATION_ID_PATTERN);
    expect(second.applicationId).toMatch(APPLICATION_ID_PATTERN);
    expect(first.applicationId).not.toBe(second.applicationId);
    expect(JobApplication.schema.path("applicationId").options.unique).toBe(true);
  });

  it("generates createdAt and updatedAt", async () => {
    const application = await makeApplication({
      createdAt: new Date("2000-01-01T00:00:00.000Z"),
      updatedAt: new Date("2000-01-01T00:00:00.000Z"),
    });
    application.initializeTimestamps();
    expect(application.createdAt).toBeInstanceOf(Date);
    expect(application.updatedAt).toBeInstanceOf(Date);
    expect(application.createdAt?.getUTCFullYear()).not.toBe(2000);
    expect(JobApplication.schema.get("timestamps")).toBe(true);
    expect(JobApplication.schema.path("createdAt")?.options.immutable).toBe(true);
  });

  it("rejects invalid job posting URLs", async () => {
    const error = await validationError({ jobPostingUrl: "careers.intact.ca/jobs/claims" });
    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect((error as mongoose.Error.ValidationError).errors).toHaveProperty("jobPostingUrl");
  });

  it("accepts valid HTTP and HTTPS job posting URLs", async () => {
    const httpsApplication = await makeApplication({
      jobPostingUrl: "https://careers.intact.ca/jobs/claims?lang=en",
    });
    const httpApplication = await makeApplication({
      jobPostingUrl: "http://example.com/jobs/claims",
    });
    expect(httpsApplication.jobPostingUrl).toBe("https://careers.intact.ca/jobs/claims?lang=en");
    expect(httpApplication.jobPostingUrl).toBe("http://example.com/jobs/claims");
  });

  it("permits multiple applications for the same employer and job", async () => {
    const applicantId = new mongoose.Types.ObjectId();
    const shared = {
      applicantId,
      employer: "Intact Insurance",
      jobTitle: "Claims Customer Service Representative",
      dateApplied: new Date("2026-08-18T12:00:00.000Z"),
    };
    const first = await makeApplication(shared);
    const second = await makeApplication(shared);
    expect(first.applicationId).not.toBe(second.applicationId);
    expect(
      JobApplication.schema.indexes().some(([keys, options]) => Boolean(options.unique) && "employer" in keys),
    ).toBe(false);
    expect(JobApplication.schema.indexes()).toEqual(
      expect.arrayContaining([
        [{ applicantId: 1, archivedAt: 1, dateApplied: -1 }, expect.any(Object)],
        [{ applicantId: 1, status: 1 }, expect.any(Object)],
      ]),
    );
  });

  it("normalizes contact email and keeps phone numbers as strings", async () => {
    const application = await makeApplication({
      contactEmail: "  Jane.Smith@Example.COM ",
      contactPhone: "+44 20 7946 0958 x204",
    });
    expect(application.contactEmail).toBe("jane.smith@example.com");
    expect(application.contactPhone).toBe("+44 20 7946 0958 x204");
  });

  it("allows planning applications without a date applied", async () => {
    const application = await makeApplication({
      status: "PLANNING_TO_APPLY",
      dateApplied: undefined,
    });
    expect(application.status).toBe("PLANNING_TO_APPLY");
    expect(application.dateApplied).toBeUndefined();
  });
});
