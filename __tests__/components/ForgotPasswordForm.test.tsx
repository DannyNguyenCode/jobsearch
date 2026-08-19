import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("requests a reset code then updates the password", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sent: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ reset: true }),
      } as Response);

    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText("Email address"), "applicant@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset code" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/forgot-password",
      expect.objectContaining({
        body: JSON.stringify({ email: "applicant@example.com" }),
      }),
    );

    expect(await screen.findByRole("heading", { name: "Enter your code" })).toBeTruthy();
    await user.type(screen.getByLabelText("6-digit code"), "123456");
    await user.type(screen.getByLabelText("New password"), "newpassword");
    await user.click(screen.getByRole("button", { name: "Reset password" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/reset-password",
      expect.objectContaining({
        body: JSON.stringify({
          email: "applicant@example.com",
          code: "123456",
          password: "newpassword",
        }),
      }),
    );
    expect(await screen.findByRole("heading", { name: "Password updated" })).toBeTruthy();
  });

  it("shows an error when the reset code cannot be sent", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Could not send the reset email. Try again shortly." }),
    } as Response);

    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("Email address"), "applicant@example.com");
    await user.click(screen.getByRole("button", { name: "Send reset code" }));

    expect(await screen.findByText("Could not send the reset email. Try again shortly.")).toBeTruthy();
  });
});
