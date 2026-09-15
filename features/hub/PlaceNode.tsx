'use client';

import Link from 'next/link';
import type { Place } from './places';

export function PlaceNode({ place, index }: { place: Place; index: number }) {
  const { label, mood, href, Icon } = place;

  return (
    <Link
      href={href}
      aria-label={label}
      className="place-node group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
      style={{
        top: `${place.top}%`,
        left: `${place.left}%`,
        animationDelay: `${300 + index * 80}ms`,
      }}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFFBF6] shadow-[0_2px_14px_rgba(142,104,115,0.1)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_6px_22px_rgba(199,169,107,0.3)] group-focus-visible:-translate-y-1 group-focus-visible:shadow-[0_6px_22px_rgba(199,169,107,0.3)] sm:h-16 sm:w-16">
        <Icon className="h-6 w-6 transition-transform duration-300 group-hover:scale-105 sm:h-7 sm:w-7" />
      </span>
      <span className="text-xs text-[#40383A] opacity-80 sm:text-sm">{label}</span>
      <span className="max-w-[8rem] text-[10px] text-[#8B8182] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:text-xs">
        {mood}
      </span>
    </Link>
  );
}
