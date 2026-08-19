import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentPanel } from "@/components/applications/DocumentPanel";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh }),
}));

describe("DocumentPanel", () => {
  beforeEach(() => {
    refresh.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("uploads a resume for a saved application", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        application: {
          documents: [
            {
              id: "1",
              kind: "resume",
              name: "resume.pdf",
              sizeLabel: "1.2 KB",
              uploadedAt: "Aug 18, 2026",
              url: "https://example.com/resume.pdf",
            },
          ],
        },
      }),
    } as Response);

    render(<DocumentPanel applicationId="cccccccccccccccccccccccc" documents={[]} />);
    const file = new File(["pdf"], "resume.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Upload Resume"), file);

    expect(fetch).toHaveBeenCalledWith(
      "/api/applications/cccccccccccccccccccccccc/documents",
      expect.objectContaining({ method: "POST" }),
    );
    const body = vi.mocked(fetch).mock.calls[0]?.[1]?.body;
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get("kind")).toBe("resume");
    expect(await screen.findByRole("link", { name: "Download resume.pdf" })).toBeTruthy();
  });

  it("lets the recruiter download files without showing upload controls", () => {
    render(
      <DocumentPanel
        compact
        documents={[
          {
            id: "1",
            kind: "resume",
            name: "Danny-resume.pdf",
            sizeLabel: "1.2 KB",
            uploadedAt: "Aug 18, 2026",
            url: "https://example.com/resume.pdf",
          },
        ]}
      />,
    );

    const download = screen.getByRole("link", { name: "Download Danny-resume.pdf" });
    expect(download.getAttribute("href")).toBe("https://example.com/resume.pdf");
    expect(screen.queryByLabelText("Upload Resume")).toBeNull();
  });

  it("replaces and deletes an uploaded resume", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          application: {
            documents: [
              {
                id: "1",
                kind: "resume",
                name: "resume-v2.pdf",
                sizeLabel: "2.0 KB",
                uploadedAt: "Aug 18, 2026",
                url: "https://example.com/resume-v2.pdf",
              },
            ],
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ application: { documents: [] } }),
      } as Response);

    render(
      <DocumentPanel
        applicationId="cccccccccccccccccccccccc"
        documents={[
          {
            id: "1",
            kind: "resume",
            name: "resume.pdf",
            sizeLabel: "1.2 KB",
            uploadedAt: "Aug 18, 2026",
            url: "https://example.com/resume.pdf",
          },
        ]}
      />,
    );

    await user.upload(
      screen.getByLabelText("Replace Resume"),
      new File(["pdf"], "resume-v2.pdf", { type: "application/pdf" }),
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/applications/cccccccccccccccccccccccc/documents",
      expect.objectContaining({ method: "POST" }),
    );
    expect(await screen.findByRole("link", { name: "Download resume-v2.pdf" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Remove Resume" }));
    expect(fetch).toHaveBeenCalledWith(
      "/api/applications/cccccccccccccccccccccccc/documents/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
