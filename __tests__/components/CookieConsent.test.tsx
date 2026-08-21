import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookieConsent, CookieSettingsButton } from "@/components/layout/CookieConsent";
import { COOKIE_CONSENT_KEY, saveCookieConsent } from "@/lib/cookie-consent";

describe("CookieConsent", () => {
  afterEach(() => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
  });

  it("slides up a banner and lets the visitor accept all cookies", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    expect(await screen.findByRole("dialog", { name: "We use cookies" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Accept all" }));

    expect(JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) ?? "{}")).toMatchObject({
      necessary: true,
      analytics: true,
      marketing: true,
    });
  });

  it("hides the banner when cookie settings are opened", async () => {
    const user = userEvent.setup();
    render(
      <>
        <CookieSettingsButton />
        <CookieConsent />
      </>,
    );

    expect(await screen.findByRole("dialog", { name: "We use cookies" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cookie Settings" }));
    expect(screen.queryByRole("dialog", { name: "We use cookies" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "Cookie settings" })).toBeTruthy();
  });

  it("lets the visitor reject non-essential cookies", async () => {
    const user = userEvent.setup();
    render(<CookieConsent />);

    await screen.findByRole("dialog", { name: "We use cookies" });
    await user.click(screen.getByRole("button", { name: "Reject" }));

    expect(JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) ?? "{}")).toMatchObject({
      necessary: true,
      analytics: false,
      marketing: false,
    });
  });

  it("opens cookie settings without showing the banner", async () => {
    const user = userEvent.setup();
    saveCookieConsent({ necessary: true, analytics: false, marketing: false });
    render(
      <>
        <CookieSettingsButton />
        <CookieConsent />
      </>,
    );

    expect(screen.queryByRole("dialog", { name: "We use cookies" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Cookie Settings" }));
    expect(screen.queryByRole("dialog", { name: "We use cookies" })).toBeNull();
    expect(await screen.findByRole("dialog", { name: "Cookie settings" })).toBeTruthy();
    await user.click(screen.getByRole("checkbox", { name: /analytics/i }));
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) ?? "{}").analytics).toBe(true);
  });
});
