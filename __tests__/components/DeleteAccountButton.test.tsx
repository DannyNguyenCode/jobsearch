import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";

const signOut = vi.fn();
vi.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => signOut(...args),
}));

describe("DeleteAccountButton", () => {
  beforeEach(() => {
    signOut.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("asks the applicant to confirm before deleting the account", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ deleted: true }),
    } as Response);

    render(<DeleteAccountButton role="applicant" />);
    await user.click(screen.getByRole("button", { name: /delete account/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/login credentials/i)).toBeTruthy();
    expect(within(dialog).getByText(/comments/i)).toBeTruthy();
    await user.click(within(dialog).getByRole("button", { name: "Delete account" }));

    expect(fetch).toHaveBeenCalledWith("/api/account", expect.objectContaining({ method: "DELETE" }));
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/login" });
  });

  it("warns recruiters that applicants stay and comments become Unknown user", async () => {
    const user = userEvent.setup();
    render(<DeleteAccountButton role="recruiter" />);
    await user.click(screen.getByRole("button", { name: /delete account/i }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/login credentials/i)).toBeTruthy();
    expect(within(dialog).getByText(/Unknown user/i)).toBeTruthy();
    expect(within(dialog).getByText(/keep their accounts/i)).toBeTruthy();
  });
});
