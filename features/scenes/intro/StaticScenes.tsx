import { Petals } from '@/features/effects/Petals';

export function WordsScene() {
  const lines = ['اليوم...', 'مش مجرد يوم زي أي يوم...', 'ده يوم بينا احنا الاتنين...'];

  return (
    <section className="relative flex min-h-screen items-center justify-center bg-warmWhite px-6 text-center">
      <Petals count={8} />
      <div className="space-y-4">
        {lines.map((line) => (
          <p key={line} className="font-arDisplay text-2xl text-ink">
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}

export function HeroScene() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream text-center">
      <p className="text-inkSoft">مساحتنا</p>
      <h1 className="font-arDisplay text-5xl text-roseDeep">أنا وإنتي</h1>
    </section>
  );
}

export function YearlyCardsScene() {
  const cards = [
    { icon: '🌸', text: 'بداية جديدة كل مرة نبقى فيها مع بعض.' },
    { icon: '🌊', text: 'أحلام بنبنيها سوا.' },
    { icon: '✨', text: 'خطوات صغيرة بتفرق كتير.' },
  ];

  return (
    <section className="flex min-h-screen items-center justify-center bg-warmWhite px-6">
      <div className="grid gap-6 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.text} className="rounded-2xl border border-rose/30 bg-cream p-8 text-center">
            <span className="mb-4 block text-3xl">{card.icon}</span>
            <p className="text-ink">{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RosesScene() {
  return (
    <section className="relative flex min-h-screen items-center justify-center bg-blush/40 px-6 text-center">
      <Petals />
      <p className="font-arDisplay text-2xl leading-relaxed text-ink">
        مثلما تتفتح الورد مع الوقت...
        <br />
        كدة إحنا كمان، بنكبر مع بعض
        <br />
        لو اعتنينا ببعض.
      </p>
    </section>
  );
}
