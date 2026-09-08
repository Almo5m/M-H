'use client';

import { useState } from 'react';

export function SealedEnvelope({ content, date }: { content: string; date: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="group relative flex h-24 w-full items-center justify-center rounded-lg bg-gradient-to-b from-goldSoft to-gold text-deep shadow-md transition-transform hover:scale-[1.02]"
      >
        <span className="absolute -top-2 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-roseDeep shadow-inner transition-transform group-hover:scale-110" />
        <span className="text-sm">دوسي تفتحي الرسالة 💌</span>
      </button>
    );
  }

  return (
    <div className="animate-[envelope-open_0.5s_ease-out] rounded-2xl bg-deep2 p-4 text-right">
      <p className="text-warmWhite">{content}</p>
      <p className="mt-2 text-xs text-inkSoft">{date}</p>
      <style>{`
        @keyframes envelope-open {
          0% { transform: scaleY(0.6); opacity: 0; }
          100% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
