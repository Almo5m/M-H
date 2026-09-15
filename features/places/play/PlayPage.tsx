import { BackToHub } from '@/features/hub/BackToHub';
import { GAME_REGISTRY } from './gameRegistry';

export function PlayPage() {
  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-xl text-center">
        <p className="font-arDisplay text-3xl text-[#40383A]">نلعب</p>
        <p className="mb-10 text-[#8E6873]">شوية وقت بعيد عن كل حاجة.</p>

        {GAME_REGISTRY.length === 0 ? (
          <div className="py-16">
            <svg viewBox="0 0 40 40" className="mx-auto mb-4 h-12 w-12">
              <ellipse cx="13" cy="24" rx="6" ry="5" fill="#B99AA1" opacity="0.6" transform="rotate(-8 13 24)" />
              <rect x="21" y="15" width="10" height="10" rx="3.5" fill="#C7A96B" opacity="0.7" transform="rotate(10 26 20)" />
            </svg>
            <p className="text-[#40383A]">لسه مفيش لعبة هنا.</p>
            <p className="mt-1 text-sm text-[#8B8182]">بس المكان جاهز.</p>
          </div>
        ) : (
          <ul className="space-y-3 text-right">
            {GAME_REGISTRY.map((game) => (
              <li key={game.key} className="list-item-enter flex items-center justify-between soft-card px-4 py-3">
                <div>
                  <p className="text-[#40383A]">{game.title}</p>
                  <p className="text-xs text-[#8B8182]">{game.description}</p>
                </div>
                <span className="text-xs text-[#8E6873]">نلعب</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
