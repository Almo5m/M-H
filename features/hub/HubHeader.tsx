'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CurrentUser } from '@/lib/auth';
import { relativeTimeAr } from '@/lib/relativeTime';

export function HubHeader({ user }: { user: CurrentUser }) {
  const [otherStatus, setOtherStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      const response = await fetch('/api/presence', { method: 'POST' });
      const data = await response.json();
      if (cancelled) return;
      if (!data.otherName) return;
      if (data.otherOnline) {
        setOtherStatus(`${data.otherName} هنا الآن`);
      } else if (data.otherLastSeenAt) {
        setOtherStatus(`${data.otherName} ${relativeTimeAr(data.otherLastSeenAt)}`);
      } else {
        setOtherStatus(null);
      }
    }

    ping();
    const interval = setInterval(ping, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-5 sm:px-10">
      <p className="font-arDisplay text-lg text-[#8E6873]">عالمنا</p>

      <div className="flex items-center gap-4 text-sm text-[#8B8182]">
        {otherStatus && <span>{otherStatus}</span>}
        <span className="text-[#40383A]">{user.displayName}</span>
        <Link href="/settings" aria-label="الإعدادات" className="opacity-60 transition hover:opacity-100">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.4">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
