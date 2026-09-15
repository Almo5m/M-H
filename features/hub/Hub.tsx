'use client';

import { useEffect, useState } from 'react';
import type { CurrentUser } from '@/lib/auth';
import { getDailyLine, getDaysTogether, getGreeting } from '@/lib/dailyLines';
import { AmbientBackground } from './AmbientBackground';
import { ScatteredHearts } from './ScatteredHearts';
import { useClickHeartBurst } from './ClickHeartBurst';
import { HubHeader } from './HubHeader';
import { CenterNode } from './CenterNode';
import { PlaceNode } from './PlaceNode';
import { OUTER_PLACES, CENTER_PLACE } from './places';

export function Hub({ user }: { user: CurrentUser }) {
  const [otherOnline, setOtherOnline] = useState(false);
  const [daysTogether, setDaysTogether] = useState<number | null>(null);
  const { handleClick, overlay } = useClickHeartBurst();

  useEffect(() => {
    fetch('/api/space-settings')
      .then((response) => response.json())
      .then((data) => setDaysTogether(getDaysTogether(data.relationshipStartDate)));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      const response = await fetch('/api/presence', { method: 'POST' });
      const data = await response.json();
      if (!cancelled) setOtherOnline(Boolean(data.otherOnline));
    }

    ping();
    const interval = setInterval(ping, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative min-h-screen" onClick={handleClick}>
      <AmbientBackground />
      <ScatteredHearts />
      {overlay}
      <HubHeader user={user} />

      <div className="mx-auto max-w-md px-6 text-center sm:hidden">
        <p className="mb-1 font-arDisplay text-xl text-[#40383A]">
          {getGreeting()} {user.displayName}
        </p>
        <p className="mb-1 text-sm text-[#8E6873]">{getDailyLine()}</p>
        {daysTogether !== null && <p className="mb-4 text-xs text-[#8B8182]">من {daysTogether} يوم إحنا مع بعض</p>}
      </div>

      {/* Desktop / tablet: organic radial layout */}
      <div className="relative mx-auto hidden aspect-square max-w-3xl sm:block" style={{ minHeight: 560 }}>
        <CenterNode otherOnline={otherOnline} />
        {OUTER_PLACES.map((place, index) => (
          <PlaceNode key={place.key} place={place} index={index} />
        ))}
      </div>

      {/* Mobile: vertical, loosely uneven two-column arrangement */}
      <div className="mx-auto grid max-w-sm grid-cols-2 gap-x-4 gap-y-8 px-6 pb-16 pt-4 sm:hidden">
        <div className="col-span-2 mb-4 flex justify-center">
          <CenterNodeMobile />
        </div>
        {OUTER_PLACES.map((place, index) => (
          <div key={place.key} className={index % 3 === 0 ? 'mt-3' : ''}>
            <PlaceNode place={place} index={index} />
          </div>
        ))}
      </div>

      <style>{`
        .place-node {
          opacity: 0;
          animation: place-enter 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes place-enter {
          from { opacity: 0; transform: translate(-50%, -46%) scale(0.92); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @media (max-width: 639px) {
          .place-node {
            position: static !important;
            transform: none !important;
          }
          @keyframes place-enter {
            from { opacity: 0; transform: translateY(8px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .place-node { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}

function CenterNodeMobile() {
  return (
    <a href={CENTER_PLACE.href} className="flex flex-col items-center gap-2">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFFBF6] shadow-[0_4px_24px_rgba(142,104,115,0.16)]">
        <svg viewBox="0 0 40 40" className="h-8 w-8 text-[#8E6873]" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="8" y="10" width="17" height="13" rx="2" transform="rotate(-6 16.5 16.5)" />
          <rect x="15" y="16" width="17" height="13" rx="2" transform="rotate(5 23.5 22.5)" />
        </svg>
      </span>
      <span className="font-arDisplay text-base text-[#40383A]">{CENTER_PLACE.label}</span>
    </a>
  );
}
