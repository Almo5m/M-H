import Link from 'next/link';

export function ComingSoon({ title, subtitle, note }: { title: string; subtitle: string; note: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F7F1E8] px-6 text-center">
      <Link href="/" className="fixed left-4 top-4 rounded-full bg-[#FFFBF6]/90 px-4 py-2 text-sm text-[#40383A] shadow">
        ← الرئيسية
      </Link>
      <p className="font-arDisplay text-3xl text-[#40383A]">{title}</p>
      <p className="text-[#8E6873]">{subtitle}</p>
      <p className="mt-6 text-sm text-[#8B8182]">{note}</p>
    </main>
  );
}
