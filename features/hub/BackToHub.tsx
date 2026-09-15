import Link from 'next/link';

export function BackToHub() {
  return (
    <Link
      href="/"
      className="fixed left-4 top-4 z-40 rounded-full bg-[#FFFBF6]/90 px-4 py-2 text-sm text-[#40383A] shadow"
    >
      ← الرئيسية
    </Link>
  );
}
