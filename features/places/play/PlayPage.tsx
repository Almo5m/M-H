import Link from 'next/link';
import { GAME_REGISTRY } from './gameRegistry';

export function PlayPage() {
  return (
    <main className="game-world page-fade-in min-h-screen px-6 py-16">
      <Link href="/" className="fixed left-4 top-4 z-40 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
        ← الرئيسية
      </Link>
      <div className="mx-auto max-w-xl text-center">
        <p className="font-arDisplay text-3xl text-[#E3C567]">نلعب</p>
        <p className="mb-10 text-white/60">شوية وقت بعيد عن كل حاجة.</p>

        <ul className="space-y-3 text-right">
          {GAME_REGISTRY.map((game) => (
            <li key={game.key} className="list-item-enter">
              <Link
                href={game.href}
                className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 backdrop-blur transition hover:bg-white/12"
              >
                <div className="flex items-center gap-3">
                  <game.Icon className="h-9 w-9" />
                  <div>
                    <p className="text-white">{game.title}</p>
                    <p className="text-xs text-white/50">{game.description}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-[#E3C567]">{game.ready ? 'نلعب' : 'قريبًا'}</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/play/history" className="mt-8 inline-block text-sm text-white/50 underline decoration-dotted">
          سجل كل النتايج
        </Link>
      </div>
    </main>
  );
}
