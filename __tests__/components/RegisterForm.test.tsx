import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/auth/RegisterForm";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    push.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("registers an applicant and goes to verification", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ email: "applicant@example.com" }),
    } as Response);
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Full name"), "Danny Nguyen");
    await user.type(screen.getByLabelText("Email address"), "applicant@example.com");
    await user.type(screen.getByLabelText("Password"), "adminadmin");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          fullName: "Danny Nguyen",
          email: "applicant@example.com",
          password: "adminadmin",
          role: "applicant",
        }),
      }),
    );
    expect(push).toHaveBeenCalledWith("/verify-email?email=applicant%40example.com");
  });

  it("registers a recruiter after switching roles", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ email: "recruiter@example.com" }),
    } as Response);
    render(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Recruiter" }));
    await user.type(screen.getByLabelText("Full name"), "Alex Rivers");
    await user.type(screen.getByLabelText("Email address"), "recruiter@example.com");
    await user.type(screen.getByLabelText("Password"), "password1");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/register",
      expect.objectContaining({
        body: JSON.stringify({
          fullName: "Alex Rivers",
          email: "recruiter@example.com",
          password: "password1",
          role: "recruiter",
        }),
      }),
    );
    expect(screen.queryByLabelText("Recruiter code (optional)")).toBeNull();
  });

  it("shows an API error", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "An account with this email already exists." }),
    } as Response);
    render(<RegisterForm />);

    await user.type(screen.getByLabelText("Full name"), "Danny Nguyen");
    await user.type(screen.getByLabelText("Email address"), "applicant@example.com");
    await user.type(screen.getByLabelText("Password"), "adminadmin");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("An account with this email already exists.")).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
  });
});
