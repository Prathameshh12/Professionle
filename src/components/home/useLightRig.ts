"use client";

import { useEffect, type RefObject } from "react";

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/**
 * Drives the moving light on the home screen:
 *  - sets --mx / --my (the smoothed cursor position) on the page element, which the glow and the hidden icons use
 *  - leans the hanging lamp toward the cursor
 *  - turns the mystery figure's head toward the cursor
 * If nobody moves the mouse for a few seconds (or on a phone), the light wanders on its own.
 */
export function useLightRig(
  page: RefObject<HTMLElement>,
  lamp: RefObject<HTMLElement>,
  figure: RefObject<HTMLElement>,
  head: RefObject<SVGGElement>
) {
  useEffect(() => {
    const pageEl = page.current;
    if (!pageEl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.35;
    let cx = tx;
    let cy = ty;
    let lastMove = 0;
    let raf = 0;

    function onMove(e: PointerEvent) {
      tx = e.clientX;
      ty = e.clientY;
      lastMove = performance.now();
    }
    window.addEventListener("pointermove", onMove, { passive: true });

    function frame(t: number) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (!reduce && t - lastMove > 3000) {
        tx = w * (0.5 + 0.34 * Math.sin(t / 2300));
        ty = h * (0.42 + 0.26 * Math.sin(t / 1700 + 1));
      }
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;

      pageEl!.style.setProperty("--mx", `${cx.toFixed(1)}px`);
      pageEl!.style.setProperty("--my", `${cy.toFixed(1)}px`);

      const lampEl = lamp.current;
      if (lampEl) {
        const lean = -clamp(((cx - w / 2) / w) * 24, -12, 12);
        lampEl.style.transform = `rotate(${lean.toFixed(2)}deg)`;
      }

      const figEl = figure.current;
      const headEl = head.current;
      if (figEl && headEl) {
        const r = figEl.getBoundingClientRect();
        const dx = clamp((cx - (r.left + r.width / 2)) / 220, -1, 1) * 4;
        const dy = clamp((cy - (r.top + 20)) / 260, -1, 1) * 3;
        headEl.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
      }

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [page, lamp, figure, head]);
}