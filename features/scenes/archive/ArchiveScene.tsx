'use client';

import { useEffect, useState } from 'react';
import type { ArchiveEntry, Partner } from '@/lib/types';

export function ArchiveScene({ who }: { who: Partner }) {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch('/api/archive');
    const data = await response.json();
    setEntries(data.entries ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setSaving(true);

    const formData = new FormData();
    formData.append('content', content.trim());
    if (file) formData.append('photo', file);

    const response = await fetch('/api/archive', { method: 'POST', body: formData });
    if (response.ok) {
      setContent('');
      setFile(null);
      await load();
    }
    setSaving(false);
  }

  return (
    <section id="archive" data-blocking="true" className="flex min-h-screen flex-col items-center gap-8 bg-warmWhite px-6 py-16">
      <h2 className="font-arDisplay text-2xl text-ink">الأرشيف</h2>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="اكتبوا حاجة عملتوها سوا..."
          className="w-full rounded-xl border border-rose/40 bg-cream px-4 py-3 outline-none"
          rows={3}
          required
        />
        <input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="text-sm" />
        <button type="submit" disabled={saving} className="w-full rounded-xl bg-roseDeep py-2 text-warmWhite disabled:opacity-40">
          {saving ? 'بيتحفظ...' : 'ضيفي للأرشيف'}
        </button>
      </form>

      <ul className="w-full max-w-md space-y-4">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={`rounded-2xl border-r-4 bg-cream p-4 text-right ${
              entry.author === who ? 'border-roseDeep' : 'border-gold'
            }`}
          >
            <p className="mb-1 text-xs text-inkSoft">
              {entry.author === who ? '🤍 إنتي/إنت' : '💛 الطرف التاني'} · {new Date(entry.created_at).toLocaleDateString('ar-EG')}
            </p>
            <p className="text-ink">{entry.content}</p>
            {entry.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.photo_url} alt="" className="mt-3 rounded-xl" />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
