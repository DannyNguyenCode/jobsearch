"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function CopyButton({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      aria-label={copied ? "Copied" : label}
      className="btn btn-ghost btn-xs btn-circle"
      type="button"
      onClick={copy}
    >
      <Icon name={copied ? "check" : "content_copy"} size={16} />
    </button>
  );
}
