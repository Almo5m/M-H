'use client';

import { useState } from 'react';

export function OpeningScene() {
  const [opened, setOpened] = useState(false);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 bg-cream text-center">
      <button
        onClick={() => {
          setOpened(true);
          document.getElementById('light-moment')?.scrollIntoView({ behavior: 'smooth' });
        }}
        className={`h-40 w-40 rounded-2xl bg-roseGold shadow-xl transition-transform duration-700 ${
          opened ? 'scale-110 rotate-6' : 'hover:scale-105'
        }`}
        aria-label="افتحي عالمنا"
      />
      <p className="font-arDisplay text-3xl text-ink">عالمنا الصغير</p>
      <p className="text-inkSoft">دوسي عشان تبدأ</p>
    </section>
  );
}
