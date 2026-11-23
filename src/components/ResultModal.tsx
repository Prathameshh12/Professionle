"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  open: boolean;
  /** Wait this long before showing, so the player can see their last answer first. */
  delay?: number;
  onClose: () => void;
  children: ReactNode;
}

/** A centred card over a dimmed screen. Closes with the X, the Escape key, or a tap outside the card. */
export function ResultModal({ open, delay = 0, onClose, children }: Props) {
  const [visible, setVisible] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  // Keeps the latest onClose without re-running the effects below every time the parent renders.
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [open, delay]);

  useEffect(() => {
    if (!open || !visible) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeRef.current();
    }
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, visible]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Case result"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl border border-manila/40 bg-panelLight shadow-2xl outline-none transition-all duration-300 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <div className="flex justify-end px-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close result"
            className="px-2 font-case text-lg leading-none text-paperDim transition-colors hover:text-manila"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}