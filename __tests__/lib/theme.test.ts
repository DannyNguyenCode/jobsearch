import { afterEach, describe, expect, it } from "vitest";
import {
  applyColorMode,
  colorModeFromTheme,
  isColorMode,
  readStoredColorMode,
  THEME_BOOTSTRAP,
  THEME_STORAGE_KEY,
  themeNameForMode,
} from "@/lib/theme";

describe("theme helpers", () => {
  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  it("maps color modes to daisyUI theme names", () => {
    expect(themeNameForMode("light")).toBe("kinetic");
    expect(themeNameForMode("dark")).toBe("kinetic-dark");
    expect(colorModeFromTheme("kinetic-dark")).toBe("dark");
    expect(colorModeFromTheme("kinetic")).toBe("light");
    expect(isColorMode("dark")).toBe(true);
    expect(isColorMode("system")).toBe(false);
  });

  it("applies the chosen mode to the document and storage", () => {
    applyColorMode("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("kinetic-dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(readStoredColorMode()).toBe("dark");
  });

  it("defaults to light when nothing is stored", () => {
    expect(readStoredColorMode()).toBe("light");
  });

  it("bootstraps from localStorage before React hydrates", () => {
    expect(THEME_BOOTSTRAP).toContain(THEME_STORAGE_KEY);
    expect(THEME_BOOTSTRAP).toContain("kinetic-dark");
  });
});
