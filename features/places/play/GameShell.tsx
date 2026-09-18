import Link from 'next/link';

// A distinct "game night" world — deep plum/navy instead of the site's
// warm ivory — so stepping into نلعب genuinely feels like a change of
// scene, not just another page in the same skin.
export function GameShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="game-world page-fade-in min-h-screen px-6 py-16">
      <Link href="/play" className="fixed left-4 top-4 z-40 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur">
        ← نلعب
      </Link>
      <p className="mb-10 text-center font-arDisplay text-3xl text-[#E3C567]">{title}</p>
      {children}
    </main>
  );
}
