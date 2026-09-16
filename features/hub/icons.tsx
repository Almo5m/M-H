// Hand-drawn FILLED icons (no strokes/outlines) — soft two-tone shapes,
// built for this project, not pulled from any icon library.

type IconProps = { className?: string };

const PRIMARY = '#8E6873';
const SECONDARY = '#B99AA1';
const GOLD = '#C7A96B';

export function UsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="7" y="9" width="18" height="14" rx="4" transform="rotate(-7 16 16)" fill={SECONDARY} opacity="0.85" />
      <rect x="15" y="17" width="18" height="14" rx="4" transform="rotate(6 24 24)" fill={PRIMARY} />
    </svg>
  );
}

export function DreamsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <path d="M20 6 L29 18 L20 30 L11 18 Z" fill={GOLD} />
      <path d="M20 30 C22 32, 19 34, 21 37 C22.5 35, 20.5 33, 20 30 Z" fill={PRIMARY} opacity="0.7" />
    </svg>
  );
}

export function RememberIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <path d="M13 7 h14 a1 1 0 0 1 1 1 v25 l-8 -6 l-8 6 v-25 a1 1 0 0 1 1 -1 Z" fill={PRIMARY} />
      <circle cx="20" cy="16" r="3" fill={GOLD} />
    </svg>
  );
}

export function ListenIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="6" y="12" width="28" height="17" rx="5" fill={SECONDARY} opacity="0.85" />
      <circle cx="15" cy="20.5" r="4.5" fill={PRIMARY} />
      <circle cx="25" cy="20.5" r="4.5" fill={PRIMARY} />
      <circle cx="15" cy="20.5" r="1.4" fill="#FFFBF6" />
      <circle cx="25" cy="20.5" r="1.4" fill="#FFFBF6" />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <ellipse cx="14" cy="24" rx="7" ry="6" fill={SECONDARY} opacity="0.85" transform="rotate(-8 14 24)" />
      <rect x="21" y="12" width="11" height="11" rx="4" fill={GOLD} transform="rotate(12 26.5 17.5)" />
    </svg>
  );
}

export function TodayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="18.5" y="14" width="3" height="18" rx="1.5" fill={PRIMARY} />
      <ellipse cx="26" cy="14" rx="6" ry="4" fill={GOLD} transform="rotate(35 26 14)" />
      <ellipse cx="14" cy="20" rx="6" ry="4" fill={SECONDARY} transform="rotate(-30 14 20)" />
    </svg>
  );
}

export function HonestyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <path d="M6 11 h17 a3 3 0 0 1 3 3 v6 a3 3 0 0 1 -3 3 h-9 l-5 5 v-5 h-3 a3 3 0 0 1 -3 -3 v-6 a3 3 0 0 1 3 -3 Z" fill={SECONDARY} opacity="0.85" />
      <path d="M17 19 h16 a3 3 0 0 1 3 3 v5 a3 3 0 0 1 -3 3 h-2 v4 l-4.5 -4 h-9.5 a3 3 0 0 1 -3 -3 v-5 a3 3 0 0 1 3 -3 Z" fill={PRIMARY} />
    </svg>
  );
}

export function SurpriseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="8" y="17" width="24" height="15" rx="3" fill={GOLD} />
      <rect x="8" y="12" width="24" height="6" rx="2" fill={PRIMARY} />
      <rect x="18" y="12" width="4" height="20" fill="#FFFBF6" opacity="0.55" />
    </svg>
  );
}

export function TicTacToeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="14" y="6" width="3.4" height="28" rx="1.7" fill={PRIMARY} />
      <rect x="23" y="6" width="3.4" height="28" rx="1.7" fill={PRIMARY} />
      <rect x="6" y="14" width="28" height="3.4" rx="1.7" fill={PRIMARY} />
      <rect x="6" y="23" width="28" height="3.4" rx="1.7" fill={PRIMARY} />
      <circle cx="10.2" cy="10.2" r="3.4" fill={GOLD} />
      <path d="M28.5 26.5 L33.5 31.5 M33.5 26.5 L28.5 31.5" stroke={GOLD} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function CategoriesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="7" y="8" width="7" height="24" rx="2.5" fill={SECONDARY} opacity="0.85" />
      <rect x="16.5" y="8" width="7" height="24" rx="2.5" fill={GOLD} />
      <rect x="26" y="8" width="7" height="24" rx="2.5" fill={PRIMARY} />
    </svg>
  );
}

export function CardsGameIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="8" y="9" width="16" height="22" rx="3" fill={SECONDARY} opacity="0.85" transform="rotate(-10 16 20)" />
      <rect x="16" y="9" width="16" height="22" rx="3" fill={PRIMARY} transform="rotate(8 24 20)" />
    </svg>
  );
}

export function LudoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <rect x="6" y="6" width="12" height="12" rx="3" fill={PRIMARY} />
      <rect x="22" y="6" width="12" height="12" rx="3" fill={GOLD} />
      <rect x="6" y="22" width="12" height="12" rx="3" fill={GOLD} />
      <rect x="22" y="22" width="12" height="12" rx="3" fill={PRIMARY} />
      <circle cx="20" cy="20" r="4" fill={SECONDARY} />
    </svg>
  );
}
