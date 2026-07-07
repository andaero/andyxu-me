"use client";

// Inline term with a definition that appears on hover/focus.
import { useState, type ReactNode } from "react";

export default function Term({ children, def }: { children: ReactNode; def: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="term"
      tabIndex={0}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span className="term-tooltip" role="tooltip" aria-hidden={!open}>
        {def}
      </span>
    </span>
  );
}
