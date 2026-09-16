'use client';

import { BackToHub } from '@/features/hub/BackToHub';

import { useEffect, useMemo, useState } from 'react';

interface RememberedDate {
  id: string;
  title: string;
  event_date: string;
  recurs_yearly: boolean;
  description: string | null;
}

interface WithNext extends RememberedDate {
  nextOccurrence: Date;
  daysUntil: number;
  isPast: boolean;
}

function nextOccurrenceOf(dateStr: string, recursYearly: boolean, today: Date): { next: Date; isPast: boolean } {
  const original = new Date(dateStr + 'T00:00:00');
  if (!recursYearly) {
    return { next: original, isPast: original.getTime() < today.getTime() };
  }
  const candidate = new Date(today.getFullYear(), original.getMonth(), original.getDate());
  if (candidate.getTime() < today.setHours(0, 0, 0, 0)) {
    candidate.setFullYear(candidate.getFullYear() + 1);
  }
  return { next: candidate, isPast: false };
}

function relativeLabel(days: number): string {
  if (days === 0) return 'النهارده';
  if (days === 1) return 'بكرة';
  if (days < 7) return `بعد ${days} أيام`;
  if (days < 31) return `بعد ${Math.round(days / 7)} أسبوع`;
  if (days < 365) return `بعد ${Math.round(days / 30)} شهر`;
  return `بعد ${Math.round(days / 365)} سنة`;
}

export function RememberPage() {
  const [dates, setDates] = useState<RememberedDate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [recursYearly, setRecursYearly] = useState(false);
  const [description, setDescription] = useState('');

  async function load() {
    const response = await fetch('/api/remembered-dates');
    const data = await response.json();
    setDates(data.dates ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  const sorted = useMemo<WithNext[]>(() => {
    const today = new Date();
    return dates
      .map((date) => {
        const { next, isPast } = nextOccurrenceOf(date.event_date, date.recurs_yearly, new Date(today));
        const daysUntil = Math.round((next.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000);
        return { ...date, nextOccurrence: next, daysUntil, isPast };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [dates]);

  const nearest = sorted.find((date) => !date.isPast);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !eventDate) return;

    await fetch('/api/remembered-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), eventDate, recursYearly, description }),
    });
    setTitle('');
    setEventDate('');
    setRecursYearly(false);
    setDescription('');
    setShowForm(false);
    load();
  }

  async function removeDate(id: string) {
    await fetch(`/api/remembered-dates/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="font-arDisplay text-3xl text-[#40383A]">نفتكر</p>
            <p className="text-[#8E6873]">عشان في أيام مينفعش تعدّي عادي.</p>
          </div>
          <button onClick={() => setShowForm((value) => !value)} className="btn-ghost">
            + نضيف تاريخ
          </button>
        </div>

        {nearest && (
          <div className="mb-8 soft-panel px-5 py-4 text-center shadow-[0_4px_24px_rgba(199,169,107,0.18)]">
            <p className="text-xs text-[#8B8182]">أقرب حاجة نفتكرها</p>
            <p className="font-arDisplay text-xl text-[#40383A]">{relativeLabel(nearest.daysUntil)}</p>
            <p className="text-sm text-[#8E6873]">{nearest.title}</p>
          </div>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 space-y-3 soft-panel p-6">
            <p className="text-sm text-[#40383A]">إيه التاريخ ده؟</p>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="اسم المناسبة"
              className="field-input"
              required
            />
            <input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="field-input"
              required
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="وصف اختياري"
              className="field-input"
              rows={2}
            />
            <label className="flex items-center gap-2 text-sm text-[#40383A]">
              <input type="checkbox" checked={recursYearly} onChange={(event) => setRecursYearly(event.target.checked)} />
              يتكرر كل سنة
            </label>
            <button type="submit" className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white">
              نحفظه
            </button>
          </form>
        )}

        {sorted.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#40383A]">لسه مفيش تواريخ محفوظة.</p>
            <p className="mt-1 text-sm text-[#8B8182]">في يوم مهم نفتكره؟</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sorted.map((date) => (
              <li
                key={date.id}
                className={`group flex items-center justify-between rounded-xl border px-4 py-3 ${
                  date.isPast ? 'border-[#8E6873]/10 bg-white/40 opacity-60' : 'border-[#8E6873]/15 bg-white'
                }`}
              >
                <div>
                  <p className="text-[#40383A]">{date.title}</p>
                  <p className="text-xs text-[#8B8182]">
                    {date.isPast
                      ? `اتعدّى · ${new Date(date.event_date).toLocaleDateString('ar-EG')}`
                      : `${relativeLabel(date.daysUntil)} · ${date.nextOccurrence.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}`}
                  </p>
                </div>
                <button
                  onClick={() => removeDate(date.id)}
                  className="text-xs text-[#8B8182] opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
