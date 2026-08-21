import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/layout/Navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/recruiter/applicants",
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ notifications: [], unreadCount: 0 }),
      }),
    );
  });

  it("shows notifications and settings", async () => {
    const user = userEvent.setup();
    render(<Navbar role="recruiter" userName="Alex Rivers" />);

    expect(screen.queryByRole("button", { name: "Search" })).toBeNull();
    expect(screen.getByRole("button", { name: "Settings" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("menuitemradio", { name: "Light" })).toBeTruthy();
    expect(screen.getByRole("menuitemradio", { name: "Dark" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No notifications yet.")).toBeTruthy();
  });
});
