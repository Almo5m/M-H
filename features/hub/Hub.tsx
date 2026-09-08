import Link from 'next/link';
import type { Partner } from '@/lib/types';
import { getDailyLine, getDaysTogether, getGreeting } from '@/lib/dailyLines';

const DOORS = [
  { href: '/questions', label: 'الأسئلة', icon: '💬' },
  { href: '/archive', label: 'الأرشيف', icon: '📖' },
  { href: '/messages', label: 'رسايل مؤجلة', icon: '✉️' },
  { href: '/memories', label: 'لحظات لينا', icon: '🖼️' },
  { href: '/dreams', label: 'أحلامنا', icon: '🌙' },
  { href: '/playlist', label: 'بلايليستنا', icon: '🎵' },
  { href: '/story', label: 'اتفرجوا على القصة تاني', icon: '✨' },
];

const DISPLAY_NAME: Record<Partner, string> = { moaz: 'معاذ', hanona: 'حنونة' };

export function Hub({ who }: { who: Partner }) {
  const daysTogether = getDaysTogether();

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 bg-cream px-6 py-16">
      <p className="font-arDisplay text-3xl text-ink">
        {getGreeting()} {DISPLAY_NAME[who]}
      </p>
      <p className="max-w-md text-center text-roseDeep">{getDailyLine()}</p>
      {daysTogether !== null && (
        <p className="text-sm text-inkSoft">من {daysTogether} يوم إحنا مع بعض 🤍</p>
      )}

      <div className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
        {DOORS.map((door) => (
          <Link
            key={door.href}
            href={door.href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-rose/30 bg-warmWhite px-4 py-8 text-center transition hover:scale-[1.03] hover:border-roseDeep"
          >
            <span className="text-3xl">{door.icon}</span>
            <span className="text-ink">{door.label}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
