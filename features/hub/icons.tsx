// Hand-drawn line-art icons for the home page — no icon library, every
// shape below is a bespoke SVG path built for this place's meaning.

type IconProps = { className?: string };

const common = {
  fill: 'none',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function UsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <rect x="8" y="10" width="17" height="13" rx="2" transform="rotate(-6 16.5 16.5)" />
      <rect x="15" y="16" width="17" height="13" rx="2" transform="rotate(5 23.5 22.5)" />
    </svg>
  );
}

export function JourneyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M7 12 C16 12, 16 20, 24 20" />
      <path d="M7 28 C16 28, 16 20, 24 20" />
      <path d="M24 20 L32 20" />
    </svg>
  );
}

export function MessageIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M20 10 C20 15, 20 15, 20 18" />
      <circle cx="20" cy="9" r="1.6" fill="currentColor" stroke="none" />
      <rect x="8" y="18" width="24" height="15" rx="2" />
      <path d="M8 19 L20 28 L32 19" />
    </svg>
  );
}

export function TodayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M20 32 C20 22, 20 18, 20 8" />
      <path d="M20 12 C24 10, 27 12, 27 15 C24 15, 21 14, 20 12" />
      <path d="M20 19 C16 17, 13 19, 13 22 C16 22, 19 21, 20 19" />
      <path d="M20 26 C24 24, 27 26, 27 29 C24 29, 21 28, 20 26" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M10 24 C10 18, 16 18, 16 24 C16 28, 10 28, 10 24 Z" />
      <path d="M22 16 L30 16 L30 24 L22 24 Z" transform="rotate(10 26 20)" />
    </svg>
  );
}

export function ListenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <rect x="6" y="13" width="28" height="16" rx="2" />
      <circle cx="15" cy="21" r="4" />
      <circle cx="25" cy="21" r="4" />
      <path d="M6 13 L12 9 L28 9 L34 13" />
    </svg>
  );
}

export function DreamsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M20 6 L28 18 L20 30 L12 18 Z" />
      <path d="M20 30 C21 33, 19 35, 21 37" />
    </svg>
  );
}

export function HonestyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M6 12 h16 a2 2 0 0 1 2 2 v6 a2 2 0 0 1 -2 2 h-9 l-4 4 v-4 h-3 a2 2 0 0 1 -2 -2 v-6 a2 2 0 0 1 2 -2 Z" />
      <path d="M18 20 h14 a2 2 0 0 1 2 2 v5 a2 2 0 0 1 -2 2 h-2 v4 l-4 -4 h-8 a2 2 0 0 1 -2 -2 v-5 a2 2 0 0 1 2 -2 Z" />
    </svg>
  );
}

export function PlacesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M20 8 C13 8, 10 14, 15 20 C17 23, 20 30, 20 32 C20 30, 23 23, 25 20 C30 14, 27 8, 20 8 Z" />
      <circle cx="20" cy="16" r="2.4" />
    </svg>
  );
}

export function SurpriseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <rect x="9" y="16" width="22" height="16" rx="1.5" />
      <path d="M9 16 L31 16" />
      <path d="M20 16 L20 32" />
      <path d="M15 16 C15 11, 18 9, 20 12 C22 9, 25 11, 25 16" />
    </svg>
  );
}

export function MomentIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M12 8 h16 M12 32 h16" />
      <path d="M12 8 C12 16, 20 18, 20 20 C20 22, 12 24, 12 32" />
      <path d="M28 8 C28 16, 20 18, 20 20 C20 22, 28 24, 28 32" />
      <rect x="17" y="18.5" width="6" height="3" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function RememberIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className} stroke="currentColor" {...common}>
      <path d="M14 8 v26" />
      <path d="M14 9 h13 l-4 5 l4 5 h-13" />
    </svg>
  );
}
