"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_SETTINGS_EVENT,
  acceptAllCookiePreferences,
  openCookieSettings,
  readCookieConsent,
  rejectOptionalCookiePreferences,
  saveCookieConsent,
  type CookiePreferences,
} from "@/lib/cookie-consent";

const EXIT_MS = 400;

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button className={className} type="button" onClick={openCookieSettings}>
      Cookie Settings
    </button>
  );
}

function CookiePreferenceToggles({
  preferences,
  onChange,
}: {
  preferences: CookiePreferences;
  onChange: (preferences: CookiePreferences) => void;
}) {
  return (
    <ul className="space-y-3">
      <li className="flex items-center justify-between gap-4 p-3 rounded-lg bg-base-200">
        <span>
          <span className="block font-medium">Strictly necessary</span>
          <span className="text-sm text-muted">Required for sign-in, security, and core site features.</span>
        </span>
        <input checked className="toggle toggle-primary" disabled type="checkbox" />
      </li>
      <li>
        <label className="flex items-center justify-between gap-4 p-3 rounded-lg bg-base-200 cursor-pointer">
          <span>
            <span className="block font-medium">Analytics</span>
            <span className="text-sm text-muted">Help us understand how the product is used so we can improve it.</span>
          </span>
          <input
            checked={preferences.analytics}
            className="toggle toggle-primary"
            type="checkbox"
            onChange={(event) => onChange({ ...preferences, analytics: event.target.checked })}
          />
        </label>
      </li>
      <li>
        <label className="flex items-center justify-between gap-4 p-3 rounded-lg bg-base-200 cursor-pointer">
          <span>
            <span className="block font-medium">Marketing</span>
            <span className="text-sm text-muted">Used to measure campaigns and show relevant product updates.</span>
          </span>
          <input
            checked={preferences.marketing}
            className="toggle toggle-primary"
            type="checkbox"
            onChange={(event) => onChange({ ...preferences, marketing: event.target.checked })}
          />
        </label>
      </li>
    </ul>
  );
}

export function CookieConsent() {
  const [bannerOpen, setBannerOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [managing, setManaging] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = readCookieConsent();
    if (stored) {
      setPreferences({
        necessary: true,
        analytics: stored.analytics,
        marketing: stored.marketing,
      });
    } else {
      setBannerOpen(true);
    }

    function onOpenSettings() {
      const current = readCookieConsent();
      if (current) {
        setPreferences({
          necessary: true,
          analytics: current.analytics,
          marketing: current.marketing,
        });
      }
      setLeaving(false);
      setManaging(false);
      setBannerOpen(false);
      setSettingsOpen(true);
    }

    window.addEventListener(COOKIE_SETTINGS_EVENT, onOpenSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, onOpenSettings);
  }, []);

  function closeBanner() {
    setLeaving(true);
    window.setTimeout(() => {
      setBannerOpen(false);
      setLeaving(false);
      setManaging(false);
    }, EXIT_MS);
  }

  function acceptAll() {
    saveCookieConsent(acceptAllCookiePreferences());
    setPreferences(acceptAllCookiePreferences());
    closeBanner();
  }

  function rejectOptional() {
    saveCookieConsent(rejectOptionalCookiePreferences());
    setPreferences(rejectOptionalCookiePreferences());
    closeBanner();
  }

  function saveManagedFromBanner() {
    saveCookieConsent(preferences);
    closeBanner();
  }

  function saveManagedFromSettings() {
    saveCookieConsent(preferences);
    setSettingsOpen(false);
  }

  return (
    <>
      {bannerOpen ? (
        <div
          aria-describedby="cookie-consent-copy"
          aria-labelledby="cookie-consent-title"
          className={`fixed inset-x-0 bottom-0 z-50 p-4 md:p-6 ${
            leaving ? "cookie-banner-exit" : "cookie-banner-enter"
          }`}
          role="dialog"
        >
          <div className="mx-auto max-w-[1440px] card-surface p-5 md:p-6 shadow-elevated">
            {managing ? (
              <div className="space-y-4">
                <div>
                  <h2 id="cookie-consent-title" className="text-lg font-semibold">
                    Cookie settings
                  </h2>
                  <p id="cookie-consent-copy" className="text-sm text-muted mt-1">
                    Choose which cookies Job Tracker Hub may use. Strictly necessary cookies are always on so you can
                    sign in and keep your session secure.
                  </p>
                </div>
                <CookiePreferenceToggles preferences={preferences} onChange={setPreferences} />
                <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                  <button className="btn btn-ghost" type="button" onClick={() => setManaging(false)}>
                    Back
                  </button>
                  <button className="btn btn-primary" type="button" onClick={saveManagedFromBanner}>
                    Save preferences
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="min-w-0 flex-1">
                  <h2 id="cookie-consent-title" className="text-lg font-semibold">
                    We use cookies
                  </h2>
                  <p id="cookie-consent-copy" className="text-sm text-muted mt-1">
                    We use cookies to keep you signed in, remember your preferences, and understand how Job Tracker Hub
                    is used. You can accept all cookies, reject non-essential cookies, or manage your cookie settings at
                    any time.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button className="btn btn-ghost" type="button" onClick={() => setManaging(true)}>
                    Manage settings
                  </button>
                  <button className="btn btn-outline" type="button" onClick={rejectOptional}>
                    Reject
                  </button>
                  <button className="btn btn-primary" type="button" onClick={acceptAll}>
                    Accept all
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div
          aria-describedby="cookie-settings-copy"
          aria-labelledby="cookie-settings-title"
          aria-modal="true"
          className="modal modal-open"
          role="dialog"
        >
          <div className="modal-box space-y-4">
            <div>
              <h2 id="cookie-settings-title" className="text-lg font-semibold">
                Cookie settings
              </h2>
              <p id="cookie-settings-copy" className="text-sm text-muted mt-1">
                Choose which cookies Job Tracker Hub may use. Strictly necessary cookies are always on so you can sign
                in and keep your session secure.
              </p>
            </div>
            <CookiePreferenceToggles preferences={preferences} onChange={setPreferences} />
            <div className="modal-action">
              <button className="btn btn-ghost" type="button" onClick={() => setSettingsOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" type="button" onClick={saveManagedFromSettings}>
                Save preferences
              </button>
            </div>
          </div>
          <button className="modal-backdrop bg-neutral/40" type="button" onClick={() => setSettingsOpen(false)}>
            Close
          </button>
        </div>
      ) : null}
    </>
  );
}
