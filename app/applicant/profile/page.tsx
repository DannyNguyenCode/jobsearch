"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Icon } from "@/components/ui/Icon";
import { currentApplicant } from "@/lib/mock-data";

export default function ApplicantProfilePage() {
  const { data: session, update } = useSession();
  const fullName = session?.user?.fullName ?? currentApplicant.name;
  const email = session?.user?.email ?? currentApplicant.email;
  const linkedCode = session?.user?.referenceCode ?? "";
  const [recruiterId, setRecruiterId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const invalid = recruiterId.trim() !== "" && !/^REC-[A-Z0-9]{6}$/i.test(recruiterId.trim());
  const [relocation, setRelocation] = useState(currentApplicant.openToRelocation);
  const [remote, setRemote] = useState(currentApplicant.remotePreferred);

  useEffect(() => {
    if (linkedCode) setRecruiterId(linkedCode);
  }, [linkedCode]);

  async function connectRecruiter() {
    setError("");
    setNotice("");
    if (!/^REC-[A-Z0-9]{6}$/i.test(recruiterId.trim())) {
      setError("Enter a recruiter code like REC-7K4P2M.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/account/reference-code", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceCode: recruiterId }),
      });
      const result = (await response.json()) as {
        error?: string;
        referenceCode?: string;
        recruiterName?: string;
      };
      if (!response.ok) {
        setError(result.error ?? "Could not link that recruiter.");
        return;
      }
      await update({ referenceCode: result.referenceCode ?? recruiterId });
      setNotice(
        result.recruiterName
          ? `Linked to ${result.recruiterName}.`
          : "Recruiter code saved to your profile.",
      );
    } catch {
      setError("Could not link that recruiter. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-4 space-y-6">
        <ProfileCard
          action={<button className="btn btn-primary w-full">Edit profile</button>}
          name={fullName}
          subtitle={currentApplicant.title}
        />
        <section className="card-surface p-6 bg-base-200">
          <h2 className="font-semibold flex items-center gap-2 mb-4">
            <Icon className="text-primary" filled name="handshake" />
            Your recruiter connection
          </h2>
          {linkedCode ? (
            <div className="p-4 bg-base-100 rounded-lg border border-outline-variant">
              <p className="text-xs uppercase tracking-wider text-muted">Linked recruiter code</p>
              <code className="text-lg font-semibold tracking-widest text-primary">{linkedCode}</code>
            </div>
          ) : (
            <p className="text-sm text-muted">
              You have not linked a recruiter yet. Enter their code below to connect this profile.
            </p>
          )}
        </section>
        <section className="card-surface p-6 relative overflow-hidden border-error">
          <div className="absolute top-0 left-0 w-1 h-full bg-error" />
          <h2 className="font-semibold flex items-center gap-2 mb-2">
            <Icon className="text-error" name="link" />
            Link recruiter
          </h2>
          <p className="text-sm text-muted mb-4">
            Enter your recruiter&apos;s unique ID to connect your profile.
          </p>
          {error ? (
            <div className="alert alert-error alert-soft mb-4">
              <Icon name="error" size={18} />
              <span>{error}</span>
            </div>
          ) : null}
          {notice ? (
            <div className="alert alert-success alert-soft mb-4">
              <Icon name="check_circle" size={18} />
              <span>{notice}</span>
            </div>
          ) : null}
          <label className="label" htmlFor="recruiter-id">
            <span className="label-text">Recruiter ID</span>
          </label>
          <input
            aria-invalid={invalid}
            className={`input w-full ${invalid ? "input-error" : ""}`}
            id="recruiter-id"
            placeholder="REC-7K4P2M"
            value={recruiterId}
            onChange={(event) => setRecruiterId(event.target.value.toUpperCase())}
          />
          {invalid ? (
            <p className="text-error text-sm mt-2 flex items-center gap-1">
              <Icon name="error" size={16} /> Invalid ID. Please check and try again.
            </p>
          ) : null}
          <button
            className="btn btn-primary w-full mt-4"
            disabled={invalid || saving || recruiterId.trim() === ""}
            type="button"
            onClick={connectRecruiter}
          >
            {saving ? <span className="loading loading-spinner loading-sm" /> : linkedCode ? "Update connection" : "Connect"}
          </button>
        </section>
      </div>
      <div className="md:col-span-8 space-y-6">
        <section className="card-surface p-6">
          <h2 className="font-semibold border-b border-outline-variant pb-3 mb-4">Personal information</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-semibold text-muted mb-1">Full name</dt>
              <dd>{fullName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted mb-1">Email address</dt>
              <dd>{email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted mb-1">Phone number</dt>
              <dd>{currentApplicant.phone}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted mb-1">Location</dt>
              <dd>{currentApplicant.location}</dd>
            </div>
          </dl>
        </section>
        <section className="card-surface p-6">
          <h2 className="font-semibold border-b border-outline-variant pb-3 mb-4">Job preferences</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span>
                <span className="block font-medium">Open to relocation</span>
                <span className="text-sm text-muted">Are you willing to move for the right role?</span>
              </span>
              <input
                checked={relocation}
                className="toggle toggle-primary"
                type="checkbox"
                onChange={(event) => setRelocation(event.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <span>
                <span className="block font-medium">Remote work</span>
                <span className="text-sm text-muted">Prefer fully remote opportunities.</span>
              </span>
              <input
                checked={remote}
                className="toggle toggle-primary"
                type="checkbox"
                onChange={(event) => setRemote(event.target.checked)}
              />
            </label>
          </div>
        </section>
        <section className="card-surface p-6">
          <h2 className="font-semibold text-error border-b border-outline-variant pb-3 mb-4">
            Security & account
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-base-200 rounded-lg text-left" type="button">
              <span className="flex items-center gap-3">
                <Icon name="lock" />
                <span>
                  <span className="block font-medium">Change password</span>
                  <span className="text-sm text-muted">Update your account password regularly.</span>
                </span>
              </span>
              <Icon className="text-muted" name="chevron_right" />
            </button>
            <LogoutButton className="w-full flex items-center gap-3 p-4 rounded-lg border border-error/30 bg-error/10 text-error">
              <Icon name="logout" />
              <span>
                <span className="block font-medium">Log out</span>
                <span className="text-sm opacity-80">Securely sign out of your Job Tracker Hub account.</span>
              </span>
            </LogoutButton>
          </div>
        </section>
      </div>
    </div>
  );
}