"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthBrand, AuthCard } from "./AuthCard";
import { Icon } from "@/components/ui/Icon";
import type { UserRole } from "@/lib/types";

export function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("applicant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const payload = {
      fullName: String(data.get("fullName") ?? ""),
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
      role,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string; email?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not create the account.");
        return;
      }
      router.push(`/verify-email?email=${encodeURIComponent(result.email ?? payload.email)}`);
    } catch {
      setError("Could not create the account. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <header className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <AuthBrand />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthCard>
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold tracking-tight">Create account</h1>
              <p className="text-muted mt-1">Keep every application you submit in one place.</p>
            </div>
            <fieldset className="mb-8">
              <legend className="text-sm font-medium mb-3">I am a...</legend>
              <div className="grid grid-cols-2 gap-4">
                {(
                  [
                    { value: "applicant", label: "Applicant", icon: "person" },
                    { value: "recruiter", label: "Recruiter", icon: "corporate_fare" },
                  ] as const
                ).map((option) => {
                  const selected = role === option.value;
                  return (
                    <button
                      aria-pressed={selected}
                      className={`rounded-lg p-4 flex flex-col items-center gap-2 border transition-colors ${
                        selected
                          ? "border-accent bg-accent/10 text-primary"
                          : "border-outline-variant hover:bg-base-200"
                      }`}
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
                    >
                      <Icon name={option.icon} size={32} />
                      <span className="font-semibold">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error ? (
                <div className="alert alert-error alert-soft">
                  <Icon name="error" size={18} />
                  <span>{error}</span>
                </div>
              ) : null}
              <input name="role" type="hidden" value={role} />
              <div>
                <label className="label" htmlFor="fullName">
                  <span className="label-text">Full name</span>
                </label>
                <input className="input w-full" id="fullName" name="fullName" required />
              </div>
              <div>
                <label className="label" htmlFor="email">
                  <span className="label-text">Email address</span>
                </label>
                <input className="input w-full" id="email" name="email" required type="email" />
              </div>
              <div>
                <label className="label" htmlFor="password">
                  <span className="label-text">Password</span>
                </label>
                <input
                  autoComplete="new-password"
                  className="input w-full"
                  id="password"
                  minLength={8}
                  name="password"
                  required
                  type="password"
                />
                <p className="text-sm text-muted mt-1">Must be at least 8 characters.</p>
              </div>
              <button className="btn btn-primary mt-2" disabled={loading} type="submit">
                {loading ? <span className="loading loading-spinner loading-sm" /> : "Create account"}
              </button>
            </form>
            <p className="text-center text-muted mt-8">
              Already have an account?{" "}
              <Link className="text-primary font-semibold hover:underline" href="/login">
                Sign in
              </Link>
            </p>
          </div>
        </AuthCard>
      </main>
      <footer className="p-8 text-center text-sm text-muted">
        © 2026 Job Tracker Hub. All rights reserved.
      </footer>
    </div>
  );
}
