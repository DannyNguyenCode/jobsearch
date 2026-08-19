"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function QuickNoteField({ placeholder = "Add a quick note..." }: { placeholder?: string }) {
  const [value, setValue] = useState("");
  const [posted, setPosted] = useState(false);

  return (
    <form
      className="relative"
      onSubmit={(event) => {
        event.preventDefault();
        if (!value.trim()) return;
        setValue("");
        setPosted(true);
        window.setTimeout(() => setPosted(false), 2000);
      }}
    >
      <label className="sr-only" htmlFor="quick-note">
        Add a quick note
      </label>
      <input
        className="input w-full pr-12"
        id="quick-note"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        aria-label="Post note"
        className="btn btn-ghost btn-sm btn-circle absolute right-1 top-1/2 -translate-y-1/2 text-primary"
        type="submit"
      >
        <Icon name="send" size={18} />
      </button>
      {posted ? (
        <p className="text-xs text-secondary mt-2" role="status">
          Note saved for this candidate.
        </p>
      ) : null}
    </form>
  );
}
