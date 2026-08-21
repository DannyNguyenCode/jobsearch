import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsMenu } from "@/components/layout/SettingsMenu";
import { THEME_STORAGE_KEY } from "@/lib/theme";

describe("SettingsMenu", () => {
  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  it("lets the user switch between light and dark mode", async () => {
    const user = userEvent.setup();
    render(<SettingsMenu />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByRole("menuitemradio", { name: "Light" })).toBeTruthy();

    await user.click(screen.getByRole("menuitemradio", { name: "Dark" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("kinetic-dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(screen.getByRole("menuitemradio", { name: "Dark" }).getAttribute("aria-checked")).toBe("true");
  });

  it("offers email support for technical difficulties", async () => {
    const user = userEvent.setup();
    render(<SettingsMenu />);

    await user.click(screen.getByRole("button", { name: "Settings" }));
    const support = screen.getByRole("menuitem", { name: /technical difficulties/i });
    expect(support.getAttribute("href")).toMatch(/^mailto:support@jobtrackerhub.com/);
    expect(support.getAttribute("href")).toContain("Technical%20difficulties");
  });
});
