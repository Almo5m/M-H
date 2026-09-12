'use client';

import Link from 'next/link';
import { CENTER_PLACE } from './places';

export function CenterNode({ otherOnline }: { otherOnline: boolean }) {
  return (
    <Link
      href={CENTER_PLACE.href}
      aria-label={CENTER_PLACE.label}
      className="place-node group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center"
      style={{ top: '50%', left: '50%', animationDelay: '0ms' }}
    >
      <span className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#8E6873]/25 bg-[#FFFBF6] shadow-md transition-transform duration-500 group-hover:-translate-y-1 sm:h-28 sm:w-28">
        <svg viewBox="0 0 60 60" className="h-10 w-10 text-[#8E6873] sm:h-12 sm:w-12">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            style={{ transition: 'd 1.2s ease', opacity: otherOnline ? 1 : 0.9 }}
            d={otherOnline ? 'M10 30 C20 30, 22 22, 30 22' : 'M10 30 C20 30, 24 16, 30 16'}
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            style={{ transition: 'd 1.2s ease', opacity: otherOnline ? 1 : 0.45 }}
            d={otherOnline ? 'M50 30 C40 30, 38 38, 30 38' : 'M50 30 C40 30, 36 44, 30 44'}
          />
        </svg>
      </span>
      <span className="font-arDisplay text-base text-[#40383A]">{CENTER_PLACE.label}</span>
    </Link>
  );
}
