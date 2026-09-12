import { GAME_REGISTRY } from './gameRegistry';

export function PlayPage() {
  return (
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-arDisplay text-3xl text-[#40383A]">نلعب</p>
        <p className="mb-10 text-[#8E6873]">شوية وقت بعيد عن كل حاجة.</p>

        {GAME_REGISTRY.length === 0 ? (
          <div className="py-16">
            <svg viewBox="0 0 40 40" className="mx-auto mb-4 h-12 w-12 text-[#B99AA1]" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M10 24 C10 18, 16 18, 16 24 C16 28, 10 28, 10 24 Z" />
              <path d="M22 16 L30 16 L30 24 L22 24 Z" transform="rotate(10 26 20)" />
            </svg>
            <p className="text-[#40383A]">لسه مفيش لعبة هنا.</p>
            <p className="mt-1 text-sm text-[#8B8182]">بس المكان جاهز.</p>
          </div>
        ) : (
          <ul className="space-y-3 text-right">
            {GAME_REGISTRY.map((game) => (
              <li key={game.key} className="flex items-center justify-between rounded-xl border border-[#8E6873]/15 bg-white px-4 py-3">
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
