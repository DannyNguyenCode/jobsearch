import { afterEach, describe, expect, it } from "vitest";
import {
  COOKIE_CONSENT_KEY,
  acceptAllCookiePreferences,
  readCookieConsent,
  rejectOptionalCookiePreferences,
  saveCookieConsent,
} from "@/lib/cookie-consent";

describe("cookie consent helpers", () => {
  afterEach(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  });

  it("stores accept-all and reject-optional choices", () => {
    saveCookieConsent(acceptAllCookiePreferences());
    expect(readCookieConsent()).toMatchObject({
      necessary: true,
      analytics: true,
      marketing: true,
    });

    saveCookieConsent(rejectOptionalCookiePreferences());
    expect(readCookieConsent()).toMatchObject({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  });
});
