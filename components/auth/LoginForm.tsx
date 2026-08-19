"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { AuthBrand, AuthCard } from "./AuthCard";
import { Icon } from "@/components/ui/Icon";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        remember: remember ? "true" : "false",
        redirect: false,
      });
      if (!result) {
        setError("Could not sign in. Try again.");
        return;
      }
      if (result.code === "email_unverified") {
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      if (result.error) {
        setError("Invalid email or password.");
        return;
      }

      const session = await getSession();
      const destination =
        session?.user?.role === "recruiter" ? "/recruiter/dashboard" : "/applicant/dashboard";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Could not sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-primary-fixed rounded-full blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[100px] opacity-40 pointer-events-none" />
      <header className="absolute top-0 left-0 p-6 md:p-8 z-10">
        <AuthBrand />
      </header>
      <main className="flex-1 flex items-center justify-center p-4 relative z-10">
        <AuthCard>
          <div className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted mt-1">Sign in to track the jobs you have already applied to.</p>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {error ? (
                <div className="alert alert-error alert-soft">
                  <Icon name="error" size={18} />
                  <span>{error}</span>
                </div>
              ) : null}
              <div>
                <label className="label" htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <label className="input flex items-center gap-2">
                  <Icon className="text-outline" name="mail" size={20} />
                  <input
                    autoComplete="email"
                    className="grow"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    type="email"
                  />
                </label>
              </div>
              <div>
                <label className="label" htmlFor="password">
                  <span className="label-text">Password</span>
                </label>
                <label className="input flex items-center gap-2">
                  <Icon className="text-outline" name="lock" size={20} />
                  <input
                    autoComplete="current-password"
                    className="grow"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="btn btn-ghost btn-xs btn-circle"
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <Icon name={showPassword ? "visibility" : "visibility_off"} size={18} />
                  </button>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <label className="label cursor-pointer gap-2 justify-start">
                  <input
                    checked={remember}
                    className="checkbox checkbox-primary checkbox-sm"
                    name="remember"
                    type="checkbox"
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span className="label-text">Remember this device</span>
                </label>
                <Link className="text-xs font-semibold text-primary hover:underline" href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              <button className="btn btn-primary" disabled={loading} type="submit">
                {loading ? <span className="loading loading-spinner loading-sm" /> : "Sign in"}
                {!loading ? <Icon name="arrow_forward" size={18} /> : null}
              </button>
            </form>
            <p className="text-sm text-center text-muted border-t border-base-300 pt-4">
              Don&apos;t have an account?{" "}
              <Link className="text-primary font-semibold hover:underline" href="/register">
                Register
              </Link>
            </p>
          </div>
        </AuthCard>
      </main>
      <footer className="p-4 text-center text-sm text-outline relative z-10">
        © 2026 Job Tracker Hub. All rights reserved.
      </footer>
    </div>
  );
}
