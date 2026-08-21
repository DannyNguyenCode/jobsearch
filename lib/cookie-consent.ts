export const COOKIE_CONSENT_KEY = "jobsearch-cookie-consent";
export const COOKIE_SETTINGS_EVENT = "jobsearch:cookie-settings";

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type StoredCookieConsent = CookiePreferences & {
  decidedAt: string;
};

export const DEFAULT_COOKIE_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function acceptAllCookiePreferences(): CookiePreferences {
  return { necessary: true, analytics: true, marketing: true };
}

export function rejectOptionalCookiePreferences(): CookiePreferences {
  return { necessary: true, analytics: false, marketing: false };
}

export function readCookieConsent(): StoredCookieConsent | null {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredCookieConsent>;
    if (!parsed.decidedAt) return null;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      decidedAt: parsed.decidedAt,
    };
  } catch {
    return null;
  }
}

export function saveCookieConsent(preferences: CookiePreferences): StoredCookieConsent {
  const stored: StoredCookieConsent = {
    ...preferences,
    necessary: true,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(stored));
  return stored;
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}
