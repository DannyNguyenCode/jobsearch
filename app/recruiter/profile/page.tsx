"use client";

import { useSession } from "next-auth/react";
import { DeleteAccountButton } from "@/components/profile/DeleteAccountButton";
import { Icon } from "@/components/ui/Icon";
import { CopyButton } from "@/components/ui/CopyButton";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { currentRecruiter } from "@/lib/mock-data";

export default function RecruiterProfilePage() {
  const { data: session } = useSession();
  const fullName = session?.user?.fullName ?? currentRecruiter.name;
  const email = session?.user?.email ?? currentRecruiter.email;
  const referenceCode = session?.user?.referenceCode ?? currentRecruiter.recruiterCode;

  return (
    <div>
      <header className="sticky top-16 z-30 bg-canvas/95 backdrop-blur -mx-4 md:-mx-8 px-4 md:px-8 py-4">
        <div className="card-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Recruiter Central</h1>
            <p className="text-sm text-muted mt-1">Manage your profile and security settings.</p>
          </div>
          <button className="btn btn-primary self-start sm:self-auto" type="button">
            Save changes
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-4 space-y-6">
          <ProfileCard name={fullName} subtitle={currentRecruiter.title}>
            <label className="label w-full mt-4">
              <span className="label-text uppercase tracking-wider">Recruiter ID</span>
            </label>
            <div className="flex items-center justify-between bg-base-200 border border-outline-variant rounded-md p-2 w-full">
              <code className="text-sm font-medium">{referenceCode || "—"}</code>
              <CopyButton label="Copy recruiter ID" value={referenceCode} />
            </div>
          </ProfileCard>
          <section className="card-surface p-6">
            <h2 className="font-semibold flex items-center gap-2 pb-2 mb-4 border-b border-outline-variant">
              <Icon name="corporate_fare" /> Organization
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted mb-1">Organization name</p>
                <p>{currentRecruiter.organization}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted mb-1">Address</p>
                <p>{currentRecruiter.organizationAddress}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted mb-1">Website</p>
                <a
                  className="text-primary hover:underline break-all"
                  href={currentRecruiter.organizationWebsite}
                  rel="noreferrer"
                  target="_blank"
                >
                  {currentRecruiter.organizationWebsite.replace(/^https?:\/\//, "")}
                </a>
              </div>
              <div>
                <label className="label" htmlFor="roleTitle">
                  <span className="label-text">Role title</span>
                </label>
                <input className="input w-full" disabled defaultValue={currentRecruiter.title} id="roleTitle" />
                <p className="text-sm text-muted mt-1">Role titles are managed by HR Administration.</p>
              </div>
            </div>
          </section>
        </div>
        <div className="lg:col-span-8 space-y-6">
          <section className="card-surface p-6">
            <h2 className="font-semibold border-b border-outline-variant pb-3 mb-4">Personal information</h2>
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
            </form>
          </section>
          <section className="card-surface p-6">
            <h2 className="font-semibold border-b border-outline-variant pb-3 mb-4">Contact information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted mb-1">Email address</p>
                <p>{email}</p>
              </div>
              <div>
                <div className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <label className="label" htmlFor="contact-phone">
                      <span className="label-text">Phone number</span>
                    </label>
                    <input className="input w-full" defaultValue={currentRecruiter.phone} id="contact-phone" />
                  </div>
                  {currentRecruiter.phoneExt ? (
                    <div className="w-24 shrink-0">
                      <label className="label" htmlFor="contact-phone-ext">
                        <span className="label-text">Ext</span>
                      </label>
                      <input
                        className="input w-full"
                        defaultValue={currentRecruiter.phoneExt}
                        id="contact-phone-ext"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="label" htmlFor="contact-location">
                  <span className="label-text">Location</span>
                </label>
                <input className="input w-full" defaultValue={currentRecruiter.location} id="contact-location" />
              </div>
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
              <DeleteAccountButton role="recruiter" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
