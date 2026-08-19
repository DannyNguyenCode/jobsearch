"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthCard } from "./AuthCard";
import { Icon } from "@/components/ui/Icon";

export function VerifyEmailCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(presetEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    presetEmail ? `We sent a 6-digit code to ${presetEmail}.` : "Enter your email and the 6-digit code we sent.",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not verify that code.");
        return;
      }
      router.push("/login");
    } catch {
      setError("Could not verify that code. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setError("");
    setResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not resend the code.");
        return;
      }
      setNotice(`A new code was sent to ${email}.`);
    } catch {
      setError("Could not resend the code. Try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4">
      <AuthCard>
        <div className="p-8 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
            <Icon filled name="mark_email_unread" size={32} />
          </div>
          <h1 className="text-3xl font-semibold text-center">Verify your email</h1>
          <p className="text-muted text-center">{notice}</p>
          <form className="w-full flex flex-col gap-4 mt-2" onSubmit={handleSubmit}>
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
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
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
            <button className="btn btn-primary" disabled={loading} type="submit">
              {loading ? <span className="loading loading-spinner loading-sm" /> : "Verify email"}
            </button>
          </form>
          <button className="btn btn-ghost btn-sm" disabled={resending} type="button" onClick={resend}>
            {resending ? "Sending…" : "Resend code"}
          </button>
          <Link className="text-sm font-medium text-primary hover:underline" href="/login">
            Return to login
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}
