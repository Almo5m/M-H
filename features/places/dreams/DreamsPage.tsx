'use client';

import { BackToHub } from '@/features/hub/BackToHub';

import { useEffect, useState } from 'react';

interface Dream {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export function DreamsPage() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [title, setTitle] = useState('');

  async function load() {
    const response = await fetch('/api/shared-dreams');
    const data = await response.json();
    setDreams(data.dreams ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addDream(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    await fetch('/api/shared-dreams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim() }),
    });
    setTitle('');
    load();
  }

  async function markAchieved(id: string) {
    await fetch('/api/shared-dreams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAchievedId: id }),
    });
    load();
  }

  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-xl">
        <p className="font-arDisplay text-3xl text-[#40383A]">أحلامنا</p>
        <p className="mb-10 text-[#8E6873]">حاجات نفسنا نعيشها سوا.</p>

        {dreams.length === 0 ? (
          <p className="py-16 text-center text-[#8B8182]">لسه مفيش أحلام مكتوبة.</p>
        ) : (
          <ul className="space-y-3">
            {dreams.map((dream) => (
              <li key={dream.id} className="soft-card list-item-enter px-4 py-3">
                <p className="text-[#40383A]">{dream.title}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-[#8B8182]">
                  <span>{dream.status === 'اتحقق' ? 'اتحقق 🤍' : dream.status}</span>
                  {dream.status !== 'اتحقق' && (
                    <button onClick={() => markAchieved(dream.id)} className="btn-chip bg-[#F7F1E8] text-[#8E6873]">
                      اتحقق
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addDream} className="mt-8 flex gap-2">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="إيه اللي نفسنا نعمله؟"
            className="flex-1 rounded-lg border border-[#8E6873]/30 bg-white px-3 py-2 text-sm outline-none"
          />
          <button type="submit" className="btn-primary">
            نحفظه
          </button>
        </form>
      </div>
    </main>
  );
}
