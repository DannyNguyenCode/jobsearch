import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CommentsPanel } from "@/components/applications/CommentsPanel";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh }),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { id: "bbbbbbbbbbbbbbbbbbbbbbbb" } }, status: "authenticated" }),
}));

describe("CommentsPanel", () => {
  beforeEach(() => {
    refresh.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("posts a comment and shows it", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        application: {
          comments: [
            {
              id: "1",
              author: "Alex Rivers",
              authorInitials: "AR",
              authorRole: "recruiter",
              createdAt: "Aug 18, 2026",
              body: "Follow up this week.",
            },
          ],
        },
      }),
    } as Response);

    render(<CommentsPanel applicationId="cccccccccccccccccccccccc" comments={[]} />);
    await user.type(screen.getByLabelText("Add a comment"), "Follow up this week.");
    await user.click(screen.getByRole("button", { name: "Post comment" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/applications/cccccccccccccccccccccccc/comments",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ body: "Follow up this week." }),
      }),
    );
    expect(await screen.findByText("Follow up this week.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Comments" })).toBeTruthy();
  });

  it("lets the author edit and delete their own comment", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          application: {
            comments: [
              {
                id: "1",
                authorId: "bbbbbbbbbbbbbbbbbbbbbbbb",
                author: "Alex Rivers",
                authorInitials: "AR",
                authorRole: "recruiter",
                createdAt: "Aug 18, 2026",
                body: "Updated note.",
              },
            ],
          },
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ application: { comments: [] } }),
      } as Response);

    render(
      <CommentsPanel
        applicationId="cccccccccccccccccccccccc"
        comments={[
          {
            id: "1",
            authorId: "bbbbbbbbbbbbbbbbbbbbbbbb",
            author: "Alex Rivers",
            authorInitials: "AR",
            authorRole: "recruiter",
            createdAt: "Aug 18, 2026",
            body: "Original note.",
          },
        ]}
        currentUserId="bbbbbbbbbbbbbbbbbbbbbbbb"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText("Edit comment"));
    await user.type(screen.getByLabelText("Edit comment"), "Updated note.");
    await user.click(screen.getByRole("button", { name: "Save comment" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/applications/cccccccccccccccccccccccc/comments/1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ body: "Updated note." }),
      }),
    );
    expect(await screen.findByText("Updated note.")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(fetch).toHaveBeenCalledWith(
      "/api/applications/cccccccccccccccccccccccc/comments/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("does not show edit controls on someone else's comment", () => {
    render(
      <CommentsPanel
        applicationId="cccccccccccccccccccccccc"
        comments={[
          {
            id: "1",
            authorId: "aaaaaaaaaaaaaaaaaaaaaaaa",
            author: "Danny Nguyen",
            authorInitials: "DN",
            authorRole: "applicant",
            createdAt: "Aug 18, 2026",
            body: "Applicant note.",
          },
        ]}
        currentUserId="bbbbbbbbbbbbbbbbbbbbbbbb"
      />,
    );

    expect(screen.getByText("Applicant note.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });
});
