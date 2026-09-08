'use client';

import { useEffect, useState } from 'react';

// The "golden thread" — a slim vertical progress line pinned to the edge
// of the screen with a glowing bead that travels down it as the story
// is scrolled, so there's always a sense of how far through it we are.
export function ScrollThread() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-y-0 left-3 z-40 hidden w-px bg-gold/25 sm:block">
      <div
        className="absolute -left-1 h-3 w-3 rounded-full bg-gold shadow-[0_0_10px_3px_rgba(217,184,138,0.7)] transition-[top] duration-150"
        style={{ top: `${progress * 100}%` }}
      />
    </div>
  );
}
