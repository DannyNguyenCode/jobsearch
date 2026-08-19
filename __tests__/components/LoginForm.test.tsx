import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/components/auth/LoginForm";

const push = vi.fn();
const refresh = vi.fn();
const signIn = vi.fn();
const getSession = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signIn(...args),
  getSession: (...args: unknown[]) => getSession(...args),
}));

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>, email = "danny@example.com") {
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), "adminadmin");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    signIn.mockReset();
    getSession.mockReset();
  });

  it("shows an error for invalid credentials", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ error: "CredentialsSignin", code: "invalid_credentials" });
    render(<LoginForm />);

    await fillAndSubmit(user);

    expect(await screen.findByText("Invalid email or password.")).toBeTruthy();
    expect(push).not.toHaveBeenCalled();
  });

  it("sends an unverified user to email verification", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ code: "email_unverified" });
    render(<LoginForm />);

    await fillAndSubmit(user, "unverified@example.com");

    expect(push).toHaveBeenCalledWith("/verify-email?email=unverified%40example.com");
  });

  it("signs an applicant in with remember-this-device enabled", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ ok: true });
    getSession.mockResolvedValue({ user: { role: "applicant" } });
    render(<LoginForm />);

    const remember = screen.getByRole("checkbox", { name: "Remember this device" }) as HTMLInputElement;
    expect(remember.checked).toBe(true);
    await fillAndSubmit(user);

    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({
        email: "danny@example.com",
        password: "adminadmin",
        remember: "true",
        redirect: false,
      }),
    );
    expect(push).toHaveBeenCalledWith("/applicant/dashboard");
  });

  it("sends remember=false when the checkbox is cleared", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ ok: true });
    getSession.mockResolvedValue({ user: { role: "applicant" } });
    render(<LoginForm />);

    await user.click(screen.getByRole("checkbox", { name: "Remember this device" }));
    await fillAndSubmit(user);

    expect(signIn).toHaveBeenCalledWith(
      "credentials",
      expect.objectContaining({ remember: "false" }),
    );
  });

  it("routes a recruiter to the recruiter dashboard", async () => {
    const user = userEvent.setup();
    signIn.mockResolvedValue({ ok: true });
    getSession.mockResolvedValue({ user: { role: "recruiter" } });
    render(<LoginForm />);

    await fillAndSubmit(user, "recruiter@example.com");

    expect(push).toHaveBeenCalledWith("/recruiter/dashboard");
  });
});
