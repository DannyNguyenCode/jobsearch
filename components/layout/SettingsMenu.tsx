"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { applyColorMode, readStoredColorMode, type ColorMode } from "@/lib/theme";

const OPTIONS: { mode: ColorMode; label: string; icon: string }[] = [
  { mode: "light", label: "Light", icon: "light_mode" },
  { mode: "dark", label: "Dark", icon: "dark_mode" },
];

export const SUPPORT_EMAIL = "support@jobtrackerhub.com";
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Technical difficulties")}`;

export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ColorMode>("light");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMode(readStoredColorMode());
  }, []);

  useEffect(() => {
    if (!open) return;
    function handlePointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function chooseMode(next: ColorMode) {
    setMode(next);
    applyColorMode(next);
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Settings"
        className="btn btn-ghost btn-circle"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        <Icon filled={open} name="settings" />
      </button>
      {open ? (
        <div
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-outline-variant bg-base-100 shadow-lg p-2"
          role="menu"
        >
          <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">Appearance</p>
          <div aria-label="Color mode" role="group">
            {OPTIONS.map((option) => {
              const selected = mode === option.mode;
              return (
                <button
                  aria-checked={selected}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                    selected ? "bg-primary-fixed/40 text-primary" : "hover:bg-primary-fixed/40"
                  }`}
                  key={option.mode}
                  role="menuitemradio"
                  type="button"
                  onClick={() => chooseMode(option.mode)}
                >
                  <Icon filled={selected} name={option.icon} size={20} />
                  <span className="flex-1 font-medium">{option.label}</span>
                  {selected ? <Icon name="check" size={18} /> : null}
                </button>
              );
            })}
          </div>
          <div className="my-2 border-t border-outline-variant" />
          <p className="px-3 pt-1 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">Support</p>
          <a
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-primary-fixed/40"
            href={SUPPORT_MAILTO}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Icon name="contact_support" size={20} />
            <span>
              <span className="block font-medium">Technical difficulties</span>
              <span className="block text-xs text-muted">Email support for app issues</span>
            </span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
