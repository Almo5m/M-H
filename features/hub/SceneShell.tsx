'use client';

import Link from 'next/link';

// Thin wrapper every standalone section page uses so there's always a
// consistent way back to the hub — the sections themselves don't need
// to know they're being reached directly instead of through the story.
export function SceneShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 rounded-full bg-warmWhite/90 px-4 py-2 text-sm text-ink shadow"
      >
        ← الرئيسية
      </Link>
      {children}
    </div>
  );
}
