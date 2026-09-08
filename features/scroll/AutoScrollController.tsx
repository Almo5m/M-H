'use client';

import { useEffect, useRef, useState } from 'react';

const SCROLL_SPEED_PX_PER_FRAME = 0.6;

// Gently auto-scrolls through the story, pausing whenever it reaches a
// section marked data-blocking="true" — those need the visitor to do
// something (answer, upload, write) before the story continues. A single
// user scroll or tap cancels auto-scroll for the rest of the session so
// it never fights someone who wants to browse freely.
export function AutoScrollController() {
  const [paused, setPaused] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const frameRef = useRef<number>();

  useEffect(() => {
    function cancelOnUserScroll() {
      setManualOverride(true);
    }
    window.addEventListener('wheel', cancelOnUserScroll, { passive: true });
    window.addEventListener('touchmove', cancelOnUserScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', cancelOnUserScroll);
      window.removeEventListener('touchmove', cancelOnUserScroll);
    };
  }, []);

  useEffect(() => {
    if (manualOverride) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    function isBlockingSectionInView(): boolean {
      const blockingSections = document.querySelectorAll('[data-blocking="true"]');
      for (const section of Array.from(blockingSections)) {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) {
          return true;
        }
      }
      return false;
    }

    function tick() {
      if (isBlockingSectionInView()) {
        setPaused(true);
      } else {
        setPaused(false);
        window.scrollBy(0, SCROLL_SPEED_PX_PER_FRAME);
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [manualOverride]);

  function handleContinue() {
    // Nudge past the current blocking section instead of disabling
    // auto-scroll altogether, so later blocking sections still pause it.
    window.scrollBy({ top: window.innerHeight * 0.6, behavior: 'smooth' });
    setPaused(false);
  }

  if (!paused) return null;

  return (
    <button
      onClick={handleContinue}
      className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-roseDeep px-6 py-3 text-sm text-warmWhite shadow-lg"
    >
      كملي القصة ↓
    </button>
  );
}
