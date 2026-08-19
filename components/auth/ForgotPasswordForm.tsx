"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "./AuthCard";
import { Icon } from "@/components/ui/Icon";

type Step = "request" | "reset" | "done";

export function ForgotPasswordForm() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not send the reset code.");
        return;
      }
      setStep("reset");
    } catch {
      setError("Could not send the reset code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not reset the password.");
        return;
      }
      setStep("done");
    } catch {
      setError("Could not reset the password. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4">
      <AuthCard className="overflow-hidden">
        <div className="h-1 bg-primary w-full" />
        <div className="p-8">
          {step === "done" ? (
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                <Icon filled name="check_circle" size={36} />
              </div>
              <h1 className="text-xl font-semibold">Password updated</h1>
              <p className="text-sm text-muted">You can sign in with your new password.</p>
              <Link className="btn btn-outline btn-primary mt-4" href="/login">
                Back to login
              </Link>
            </div>
          ) : step === "reset" ? (
            <>
              <div className="text-center mb-8">
                <Icon className="text-primary" name="mark_email_unread" size={48} />
                <h1 className="text-3xl font-semibold mt-4">Enter your code</h1>
                <p className="text-muted mt-1">
                  If an account exists for {email}, we sent a 6-digit reset code.
                </p>
              </div>
              <form className="flex flex-col gap-4" onSubmit={resetPassword}>
                {error ? (
                  <div className="alert alert-error alert-soft">
                    <Icon name="error" size={18} />
                    <span>{error}</span>
                  </div>
                ) : null}
                <div>
                  <label className="label" htmlFor="code">
                    <span className="label-text">6-digit code</span>
                  </label>
                  <input
                    autoComplete="one-time-code"
                    className="input w-full tracking-[0.4em] text-center text-lg"
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="\d{6}"
                    placeholder="000000"
                    required
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="password">
                    <span className="label-text">New password</span>
                  </label>
                  <input
                    autoComplete="new-password"
                    className="input w-full"
                    id="password"
                    minLength={8}
                    required
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </div>
                <button className="btn btn-primary" disabled={loading} type="submit">
                  {loading ? <span className="loading loading-spinner loading-sm" /> : "Reset password"}
                </button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => setStep("request")}>
                  Use a different email
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <Icon className="text-primary" name="lock_reset" size={48} />
                <h1 className="text-3xl font-semibold mt-4">Forgot password</h1>
                <p className="text-muted mt-1">Enter your email to receive a 6-digit reset code.</p>
              </div>
              <form className="flex flex-col gap-4" onSubmit={requestCode}>
                {error ? (
                  <div className="alert alert-error alert-soft">
                    <Icon name="error" size={18} />
                    <span>{error}</span>
                  </div>
                ) : null}
                <div>
                  <label className="label" htmlFor="email">
                    <span className="label-text">Email address</span>
                  </label>
                  <input
                    className="input w-full"
                    id="email"
                    placeholder="name@company.com"
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
                <button className="btn btn-primary" disabled={loading} type="submit">
                  {loading ? <span className="loading loading-spinner loading-sm" /> : "Send reset code"}
                  {!loading ? <Icon name="arrow_forward" size={18} /> : null}
                </button>
                <Link className="text-center text-sm font-medium text-primary hover:underline" href="/login">
                  Return to login
                </Link>
              </form>
            </>
          )}
        </div>
      </AuthCard>
    </div>
  );
}
