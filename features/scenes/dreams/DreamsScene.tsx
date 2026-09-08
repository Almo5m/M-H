'use client';

import { useEffect, useState } from 'react';
import type { SharedDream } from '@/lib/types';

export function DreamsScene() {
  const [dreams, setDreams] = useState<SharedDream[]>([]);
  const [newDream, setNewDream] = useState('');
  const [highlightIndex, setHighlightIndex] = useState(0);

  async function load() {
    const response = await fetch('/api/dreams');
    const data = await response.json();
    const list: SharedDream[] = data.dreams ?? [];
    setDreams(list);
    if (list.length > 0) setHighlightIndex(Math.floor(Math.random() * list.length));
  }

  useEffect(() => {
    load();
  }, []);

  async function addDream(event: React.FormEvent) {
    event.preventDefault();
    if (!newDream.trim()) return;
    await fetch('/api/dreams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newDream.trim() }),
    });
    setNewDream('');
    load();
  }

  async function markAchieved(id: string) {
    await fetch('/api/dreams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAchievedId: id }),
    });
    load();
  }

  const achievedCount = dreams.filter((dream) => dream.achieved).length;
  const progress = dreams.length > 0 ? Math.round((achievedCount / dreams.length) * 100) : 0;
  const highlighted = dreams[highlightIndex];

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 bg-cream px-6 py-16 text-center">
      <h2 className="font-arDisplay text-2xl text-ink">أحلامنا</h2>

      {highlighted && (
        <p className="max-w-md text-xl text-roseDeep">
          {highlighted.achieved ? '✓ ' : ''}
          {highlighted.content}
        </p>
      )}

      <div className="w-full max-w-md">
        <div className="h-3 w-full overflow-hidden rounded-full bg-blush">
          <div className="h-full bg-roseDeep transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-sm text-inkSoft">
          {achievedCount} من {dreams.length} اتحقق
        </p>
      </div>

      <ul className="w-full max-w-md space-y-2 text-right">
        {dreams.map((dream) => (
          <li key={dream.id} className="flex items-center justify-between rounded-xl bg-warmWhite px-4 py-2">
            <span className={dream.achieved ? 'text-inkSoft line-through' : 'text-ink'}>{dream.content}</span>
            {!dream.achieved && (
              <button onClick={() => markAchieved(dream.id)} className="text-sm text-roseDeep">
                اتحقق ✓
              </button>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={addDream} className="flex w-full max-w-md gap-2">
        <input
          type="text"
          value={newDream}
          onChange={(event) => setNewDream(event.target.value)}
          placeholder="حلم جديد..."
          className="flex-1 rounded-xl border border-rose/40 bg-warmWhite px-4 py-2 outline-none"
        />
        <button type="submit" className="rounded-xl bg-roseDeep px-5 py-2 text-warmWhite">
          ضيفي
        </button>
      </form>
    </section>
  );
}
