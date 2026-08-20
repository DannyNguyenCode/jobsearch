"use client";

import { Icon } from "@/components/ui/Icon";

export function PrintJobSearchLogButton() {
  return (
    <button className="btn btn-primary print:hidden" type="button" onClick={() => window.print()}>
      <Icon name="print" size={18} />
      Print
    </button>
  );
}
