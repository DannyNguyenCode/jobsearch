"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DocumentPanel } from "./DocumentPanel";
import { ApplicationLifecycleActions } from "./ApplicationLifecycleActions";
import { Icon } from "@/components/ui/Icon";
import { Toast } from "@/components/ui/Toast";
import { STATUS_OPTIONS, STATUS_LABELS } from "@/lib/status";
import { APPLICATION_SOURCE_LABELS, APPLICATION_SOURCES } from "@/lib/application-source";
import { DOCUMENT_UPLOAD_KINDS, type DocumentUploadKind } from "@/lib/document-kind";
import { postApplicationDocument } from "@/lib/document-upload";
import { todayInput } from "@/lib/dates";
import type { ApplicationSource, ApplicationStatus, JobApplication } from "@/lib/types";

type ApplicationFormProps = {
  application?: JobApplication;
  cancelHref: string;
};

const EMPTY = {
  position: "",
  organization: "",
  location: "",
  postingUrl: "",
  source: "jobBoard" as ApplicationSource,
  contactName: "",
  contactEmail: "",
  phone: "",
  notes: "",
  dateApplied: todayInput(),
  status: "applied" as ApplicationStatus,
};

export function ApplicationForm({ application, cancelHref }: ApplicationFormProps) {
  const router = useRouter();
  const initial = application
    ? {
        position: application.position,
        organization: application.organization,
        location: application.location,
        postingUrl: application.postingUrl,
        source: application.source,
        contactName: application.contactName,
        contactEmail: application.contactEmail,
        phone: application.phone,
        notes: application.notes,
        dateApplied: application.dateApplied,
        status: application.status,
      }
    : { ...EMPTY };

  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastDescription, setToastDescription] = useState("Your tracker now includes this job.");
  const [pendingFiles, setPendingFiles] = useState<Partial<Record<DocumentUploadKind, File>>>({});

  const orgError = submitted && values.organization.trim() === "";
  const positionError = submitted && values.position.trim() === "";

  function setPendingFile(kind: DocumentUploadKind, file: File | null) {
    setPendingFiles((current) => {
      const next = { ...current };
      if (file) next[kind] = file;
      else delete next[kind];
      return next;
    });
  }

  function update<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    if (values.organization.trim() === "" || values.position.trim() === "") return;

    setSaving(true);
    try {
      const endpoint = application ? `/api/applications/${application.id}` : "/api/applications";
      const response = await fetch(endpoint, {
        method: application ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { error?: string; application?: { id: string } };
      if (!response.ok || !result.application) {
        setError(result.error ?? "Could not save the application.");
        return;
      }

      let description = "Your tracker now includes this job.";
      if (!application) {
        for (const kind of DOCUMENT_UPLOAD_KINDS) {
          const file = pendingFiles[kind];
          if (!file) continue;
          try {
            await postApplicationDocument(result.application.id, kind, file);
          } catch {
            description = "Saved, but a document could not be uploaded. Add it from Edit.";
          }
        }
      }

      setToastDescription(description);
      setToastOpen(true);
      router.push(`/applicant/applications/${result.application.id}`);
      router.refresh();
    } catch {
      setError("Could not save the application. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="sticky top-16 z-30 bg-base-100/90 backdrop-blur border-b border-outline-variant -mx-4 md:-mx-8 px-4 md:px-8 py-4">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Dashboard", href: "/applicant/dashboard" },
                { label: "Applications" },
                { label: application ? "Edit application" : "New application" },
              ]}
            />
            <h1 className="text-3xl font-semibold mt-1">
              {application ? "Edit application" : "Log an application"}
            </h1>
            <p className="text-sm text-muted mt-1">
              Record a job you already applied to. Job Tracker Hub does not list openings.
            </p>
          </div>
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button className="btn btn-ghost" disabled={saving} type="button" onClick={() => router.push(cancelHref)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={saving} form="application-form" type="submit">
              {saving ? <span className="loading loading-spinner loading-sm" /> : <Icon name="save" size={18} />}
              {saving ? "Saving..." : "Save application"}
            </button>
          </div>
        </div>
      </header>

            <form
        className="max-w-[1200px] mx-auto mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        id="application-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="lg:col-span-8 flex flex-col gap-6">
          {error ? (
            <div className="alert alert-error alert-soft lg:col-span-8">
              <Icon name="error" size={18} />
              <span>{error}</span>
            </div>
          ) : null}
          <section className="card-surface p-6">
            <h2 className="font-semibold flex items-center gap-2 pb-3 mb-4 border-b border-base-300">
              <Icon className="text-primary" name="work" size={20} />
              Job details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label" htmlFor="position">
                  <span className="label-text">Position applied for <span className="text-error">*</span></span>
                </label>
                <input
                  aria-invalid={positionError}
                  className={`input w-full ${positionError ? "input-error" : ""}`}
                  id="position"
                  required
                  value={values.position}
                  onChange={(event) => update("position", event.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="organization">
                  <span className="label-text">Organization name <span className="text-error">*</span></span>
                </label>
                <input
                  aria-describedby={orgError ? "organization-error" : undefined}
                  aria-invalid={orgError}
                  className={`input w-full ${orgError ? "input-error" : ""}`}
                  id="organization"
                  required
                  value={values.organization}
                  onChange={(event) => update("organization", event.target.value)}
                />
                {orgError ? (
                  <p className="text-error text-xs mt-1 flex items-center gap-1" id="organization-error">
                    <Icon name="error" size={14} />
                    Organization name is required
                  </p>
                ) : null}
              </div>
              <div>
                <label className="label" htmlFor="location">
                  <span className="label-text">Address / location</span>
                </label>
                <input
                  className="input w-full"
                  id="location"
                  value={values.location}
                  onChange={(event) => update("location", event.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="source">
                  <span className="label-text">Where you found this job</span>
                </label>
                <select
                  className="select w-full"
                  id="source"
                  value={values.source}
                  onChange={(event) => update("source", event.target.value as ApplicationSource)}
                >
                  {APPLICATION_SOURCES.map((source) => (
                    <option key={source} value={source}>
                      {APPLICATION_SOURCE_LABELS[source]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label" htmlFor="postingUrl">
                  <span className="label-text">Posting link</span>
                </label>
                <label className="input flex items-center gap-2">
                  <Icon className="text-muted" name="link" size={18} />
                  <input
                    className="grow"
                    id="postingUrl"
                    placeholder="https://..."
                    type="url"
                    value={values.postingUrl}
                    onChange={(event) => update("postingUrl", event.target.value)}
                  />
                </label>
                <p className="text-sm text-muted mt-1">
                  Paste the link to the posting you applied to.
                </p>
              </div>
            </div>
          </section>

          <section className="card-surface p-6">
            <h2 className="font-semibold flex items-center gap-2 pb-3 mb-4 border-b border-base-300">
              <Icon className="text-primary" name="contact_page" size={20} />
              Employer contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label" htmlFor="contactName">
                  <span className="label-text">Contact name</span>
                </label>
                <input
                  className="input w-full"
                  id="contactName"
                  value={values.contactName}
                  onChange={(event) => update("contactName", event.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="contactEmail">
                  <span className="label-text">Email</span>
                </label>
                <input
                  className="input w-full"
                  id="contactEmail"
                  type="email"
                  value={values.contactEmail}
                  onChange={(event) => update("contactEmail", event.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  <span className="label-text">Phone number</span>
                </label>
                <input
                  className="input w-full"
                  id="phone"
                  type="tel"
                  value={values.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="card-surface p-6">
            <h2 className="font-semibold flex items-center gap-2 pb-3 mb-4 border-b border-base-300">
              <Icon className="text-primary" name="sticky_note_2" size={20} />
              Notes
            </h2>
            <label className="sr-only" htmlFor="notes">
              Notes
            </label>
            <textarea
              className="textarea w-full min-h-28"
              id="notes"
              placeholder="Add any specific context, salary requirements, or reminders here..."
              value={values.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="card-surface p-6">
            <h2 className="font-semibold flex items-center gap-2 pb-3 mb-4 border-b border-base-300">
              <Icon className="text-primary" name="flag" size={20} />
              Status
            </h2>
            <label className="label" htmlFor="dateApplied">
              <span className="label-text">Date applied</span>
            </label>
            <input
              className="input w-full"
              id="dateApplied"
              type="date"
              value={values.dateApplied}
              onChange={(event) => update("dateApplied", event.target.value)}
            />
            <label className="label mt-3" htmlFor="status">
              <span className="label-text">Status</span>
            </label>
            <select
              className="select w-full"
              id="status"
              value={values.status}
              onChange={(event) => update("status", event.target.value as ApplicationStatus)}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </section>

          <DocumentPanel
            applicationId={application?.id}
            documents={application?.documents ?? []}
            pending={application ? undefined : pendingFiles}
            onPendingChange={application ? undefined : setPendingFile}
          />

          <div className="alert bg-primary-fixed text-info-content border-primary-fixed">
            <Icon filled name="info" />
            <div>
              <p className="font-medium">Collaboration active</p>
              <p className="text-sm">
                Your recruiter will be automatically notified when this application is saved or updated.
              </p>
            </div>
          </div>

          {application ? (
            <ApplicationLifecycleActions applicationId={application.id} status={application.status} />
          ) : null}
        </div>
      </form>

      <Toast
        description={toastDescription}
        open={toastOpen}
        title="Application saved"
        onClose={() => setToastOpen(false)}
      />
    </>
  );
}