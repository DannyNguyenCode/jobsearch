import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationForm } from "@/components/applications/ApplicationForm";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

describe("ApplicationForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("saves a new application", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ application: { id: "cccccccccccccccccccccccc" } }),
    } as Response);

    render(<ApplicationForm cancelHref="/applicant/dashboard" />);

    expect(screen.getByLabelText("Date")).toBeTruthy();
    expect(screen.queryByLabelText("Date applied")).toBeNull();

    await user.type(screen.getByLabelText(/Position applied for/), "Frontend Engineer");
    await user.type(screen.getByLabelText(/Organization name/), "TechCorp");
    await user.click(screen.getAllByRole("button", { name: "Save application" })[0]);

    expect(fetch).toHaveBeenCalledWith(
      "/api/applications",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Frontend Engineer"),
      }),
    );
    expect(push).toHaveBeenCalledWith("/applicant/applications/cccccccccccccccccccccccc");
  });
});
