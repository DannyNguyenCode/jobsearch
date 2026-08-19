import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VerifyEmailCard } from "@/components/auth/VerifyEmailCard";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("email=applicant@example.com"),
}));

describe("VerifyEmailCard", () => {
  beforeEach(() => {
    push.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("verifies a 6-digit code and returns to login", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ verified: true }),
    } as Response);

    render(<VerifyEmailCard />);

    expect((screen.getByLabelText("Email address") as HTMLInputElement).value).toBe("applicant@example.com");
    await user.type(screen.getByLabelText("6-digit code"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify email" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/verify-email",
      expect.objectContaining({
        body: JSON.stringify({ email: "applicant@example.com", code: "123456" }),
      }),
    );
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("resends a verification code", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ sent: true }),
    } as Response);

    render(<VerifyEmailCard />);
    await user.click(screen.getByRole("button", { name: "Resend code" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/resend-verification",
      expect.objectContaining({
        body: JSON.stringify({ email: "applicant@example.com" }),
      }),
    );
    expect(await screen.findByText("A new code was sent to applicant@example.com.")).toBeTruthy();
  });

  it("shows an error for an invalid code", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Invalid or expired verification code." }),
    } as Response);

    render(<VerifyEmailCard />);
    await user.type(screen.getByLabelText("6-digit code"), "000000");
    await user.click(screen.getByRole("button", { name: "Verify email" }));

    expect(await screen.findByText("Invalid or expired verification code.")).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
  });
});
