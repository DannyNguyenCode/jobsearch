export const THEME_STORAGE_KEY = "jobsearch-theme";

export const COLOR_MODES = ["light", "dark"] as const;
export type ColorMode = (typeof COLOR_MODES)[number];

export const THEME_BY_MODE: Record<ColorMode, string> = {
  light: "kinetic",
  dark: "kinetic-dark",
};

export function isColorMode(value: string | null | undefined): value is ColorMode {
  return value === "light" || value === "dark";
}

export function themeNameForMode(mode: ColorMode) {
  return THEME_BY_MODE[mode];
}

export function colorModeFromTheme(theme: string | null | undefined): ColorMode {
  return theme === THEME_BY_MODE.dark ? "dark" : "light";
}

export function applyColorMode(mode: ColorMode) {
  const root = document.documentElement;
  root.setAttribute("data-theme", themeNameForMode(mode));
  root.style.colorScheme = mode;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

export function readStoredColorMode(): ColorMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isColorMode(stored)) return stored;
  } catch {
    /* ignore private mode / blocked storage */
  }
  return "light";
}

export const THEME_BOOTSTRAP = `(function(){try{var m=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var dark=m==="dark";var d=document.documentElement;d.setAttribute("data-theme",dark?"kinetic-dark":"kinetic");d.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;
