"use client";

import { useSession } from "next-auth/react";
import { Icon } from "@/components/ui/Icon";
import { CopyButton } from "@/components/ui/CopyButton";
import { ProfileCard, InfoRow } from "@/components/profile/ProfileCard";
import { currentRecruiter } from "@/lib/mock-data";

export default function RecruiterProfilePage() {
  const { data: session } = useSession();
  const fullName = session?.user?.fullName ?? currentRecruiter.name;
  const email = session?.user?.email ?? currentRecruiter.email;
  const referenceCode = session?.user?.referenceCode ?? currentRecruiter.recruiterCode;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Recruiter Central</h1>
        <p className="text-lg text-muted mt-1">Manage your profile, metrics, and security settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <ProfileCard
            action={<button className="btn btn-outline btn-primary w-full">Edit profile</button>}
            name={fullName}
            subtitle={currentRecruiter.title}
          >
            <label className="label w-full mt-4">
              <span className="label-text uppercase tracking-wider">Recruiter ID</span>
            </label>
            <div className="flex items-center justify-between bg-base-200 border border-outline-variant rounded-md p-2 w-full">
              <code className="text-sm font-medium">{referenceCode || "—"}</code>
              <CopyButton label="Copy recruiter ID" value={referenceCode} />
            </div>
            <div className="mt-4 space-y-2 w-full text-left">
              <InfoRow icon="mail">{email}</InfoRow>
              <InfoRow icon="phone">{currentRecruiter.phone}</InfoRow>
              <InfoRow icon="location_on">{currentRecruiter.location}</InfoRow>
            </div>
          </ProfileCard>
          <section className="card-surface p-6">
            <h2 className="font-semibold pb-2 mb-4 border-b border-outline-variant">Performance snapshot</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted">Applicants managed</p>
                <p className="text-4xl font-bold text-primary">{currentRecruiter.applicantsManaged.toLocaleString()}</p>
                <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                  <Icon name="trending_up" size={16} /> +12% this quarter
                </p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-primary-fixed border-t-primary flex items-center justify-center text-primary">
                <Icon name="group" />
              </div>
            </div>
          </section>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <section className="card-surface p-6">
            <h2 className="text-xl font-semibold pb-3 mb-6 border-b border-outline-variant">Account security</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Icon name="password" /> Password management
                </h3>
                <p className="text-sm text-muted mb-4">Update your password regularly to maintain security.</p>
                <label className="label" htmlFor="current-password">
                  <span className="label-text">Current password</span>
                </label>
                <input className="input w-full" disabled id="current-password" type="password" value="********" />
                <p className="text-sm text-muted mt-2">Last changed: 45 days ago</p>
                <button className="btn btn-primary mt-3" type="button">
                  Change password
                </button>
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2">
                  <Icon name="devices" /> Active sessions
                </h3>
                <p className="text-sm text-muted mb-4">Review devices logged into your account.</p>
                <div className="space-y-2">
                  <div className="bg-base-200 border border-outline-variant rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="text-primary" name="computer" />
                      <div>
                        <p className="font-medium">MacBook Pro · Safari</p>
                        <p className="text-sm text-muted">Chicago, IL • Active now</p>
                      </div>
                    </div>
                    <span className="badge badge-secondary">Current</span>
                  </div>
                  <div className="bg-base-200 border border-outline-variant rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name="smartphone" />
                      <div>
                        <p className="font-medium">iPhone 14 · App</p>
                        <p className="text-sm text-muted">Chicago, IL • 2 hours ago</p>
                      </div>
                    </div>
                    <button aria-label="Sign out iPhone session" className="btn btn-ghost btn-sm btn-circle" type="button">
                      <Icon name="logout" size={18} />
                    </button>
                  </div>
                </div>
                <button className="btn btn-link text-primary mt-2" type="button">
                  Sign out of all other devices
                </button>
              </div>
            </div>
          </section>
          <section className="card-surface p-6">
            <h2 className="text-xl font-semibold pb-3 mb-6 border-b border-outline-variant">Personal information</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="fullName">
                  <span className="label-text">Full name</span>
                </label>
                <input className="input w-full" defaultValue={fullName} id="fullName" />
              </div>
              <div>
                <label className="label" htmlFor="preferredName">
                  <span className="label-text">Preferred name</span>
                </label>
                <input
                  className="input w-full"
                  defaultValue={currentRecruiter.preferredName}
                  id="preferredName"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label" htmlFor="roleTitle">
                  <span className="label-text">Role title</span>
                </label>
                <input className="input w-full" disabled defaultValue={currentRecruiter.title} id="roleTitle" />
                <p className="text-sm text-muted mt-1">Role titles are managed by HR Administration.</p>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <button className="btn btn-outline" type="button">
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Save changes
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}