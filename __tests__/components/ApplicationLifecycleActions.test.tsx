import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApplicationLifecycleActions } from "@/components/applications/ApplicationLifecycleActions";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

const applicationId = "cccccccccccccccccccccccc";

describe("ApplicationLifecycleActions", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("archives an active application", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as Response);

    render(<ApplicationLifecycleActions applicationId={applicationId} status="applied" />);
    await user.click(screen.getByRole("button", { name: "Archive" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Archive" }));

    expect(fetch).toHaveBeenCalledWith(
      `/api/applications/${applicationId}`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "archived" }),
      }),
    );
    expect(push).toHaveBeenCalledWith("/applicant/archived");
  });

  it("deletes an application permanently", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ deleted: true }) } as Response);

    render(<ApplicationLifecycleActions applicationId={applicationId} status="applied" />);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Delete permanently" }));

    expect(fetch).toHaveBeenCalledWith(
      `/api/applications/${applicationId}`,
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(push).toHaveBeenCalledWith("/applicant/dashboard");
  });

  it("restores an archived application", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as Response);

    render(<ApplicationLifecycleActions applicationId={applicationId} status="archived" />);
    await user.click(screen.getByRole("button", { name: "Restore" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Restore" }));

    expect(fetch).toHaveBeenCalledWith(
      `/api/applications/${applicationId}`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "applied" }),
      }),
    );
  });
});
