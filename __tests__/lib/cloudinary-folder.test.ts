import { afterEach, describe, expect, it } from "vitest";
import { cloudinaryApplicationFolder } from "@/lib/cloudinary-folder";
import { cloudinaryPublicIdForKind, isDocumentUploadKind } from "@/lib/document-kind";
import { documentSizeLabel, isAllowedDocument } from "@/lib/files";

describe("cloudinary folders", () => {
  const previous = process.env.CLOUDINARY_UPLOAD_FOLDER;

  afterEach(() => {
    process.env.CLOUDINARY_UPLOAD_FOLDER = previous;
  });

  it("stores files under jobtrackerhub/{person}/{jobtitle-dd-mm-yyyy}", () => {
    process.env.CLOUDINARY_UPLOAD_FOLDER = "jobtrackerhub";
    expect(cloudinaryApplicationFolder("Alex Johnson", "Customer Service", new Date(2026, 7, 18))).toBe(
      "jobtrackerhub/alex-johnson/customerservice-18-08-2026",
    );
    expect(cloudinaryApplicationFolder("Danny Nguyen", "Frontend Engineer", new Date(2026, 7, 18))).toBe(
      "jobtrackerhub/danny-nguyen/frontendengineer-18-08-2026",
    );
  });

  it("uses stable public ids for resume and job description", () => {
    expect(cloudinaryPublicIdForKind("resume")).toBe("resume");
    expect(cloudinaryPublicIdForKind("jobPosting")).toBe("job-description");
    expect(isDocumentUploadKind("resume")).toBe(true);
    expect(isDocumentUploadKind("coverLetter")).toBe(false);
  });
});

describe("document files", () => {
  it("accepts a pdf under 10MB", () => {
    expect(isAllowedDocument({ name: "resume.pdf", type: "application/pdf", size: 1200 })).toBe(true);
    expect(documentSizeLabel(1200)).toBe("1.2 KB");
  });

  it("rejects an oversized or unknown file", () => {
    expect(isAllowedDocument({ name: "resume.pdf", type: "application/pdf", size: 11 * 1024 * 1024 })).toBe(false);
    expect(isAllowedDocument({ name: "notes.exe", type: "application/octet-stream", size: 100 })).toBe(false);
  });
});
