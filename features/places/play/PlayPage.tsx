import Link from 'next/link';
import { BackToHub } from '@/features/hub/BackToHub';
import { GAME_REGISTRY } from './gameRegistry';

export function PlayPage() {
  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-xl text-center">
        <p className="font-arDisplay text-3xl text-[#40383A]">نلعب</p>
        <p className="mb-10 text-[#8E6873]">شوية وقت بعيد عن كل حاجة.</p>

        <ul className="space-y-3 text-right">
          {GAME_REGISTRY.map((game) => (
            <li key={game.key} className="list-item-enter">
              <Link
                href={game.href}
                className="soft-card flex items-center justify-between px-4 py-3 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3">
                  <game.Icon className="h-9 w-9" />
                  <div>
                    <p className="text-[#40383A]">{game.title}</p>
                    <p className="text-xs text-[#8B8182]">{game.description}</p>
                  </div>
                </div>
                <span className="btn-chip bg-[#F7F1E8] text-[#8E6873]">{game.ready ? 'نلعب' : 'قريبًا'}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
