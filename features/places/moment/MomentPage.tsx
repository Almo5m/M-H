'use client';

import { useEffect, useState } from 'react';

interface Moment {
  id: string;
  content: string;
  photo_url: string | null;
  author_name: string | null;
  occurred_at: string;
}

export function MomentPage() {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [content, setContent] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch('/api/moments');
    const data = await response.json();
    setMoments(data.moments ?? []);
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
    if (photo) formData.append('photo', photo);

    const response = await fetch('/api/moments', { method: 'POST', body: formData });
    if (response.ok) {
      setContent('');
      setPhoto(null);
      await load();
    }
    setSaving(false);
  }

  async function removeMoment(id: string) {
    await fetch(`/api/moments/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <p className="font-arDisplay text-3xl text-[#40383A]">لحظة</p>
        <p className="mb-8 text-[#8E6873]">قبل ما تعدّي... نخليها تفضل.</p>

        <form onSubmit={handleSubmit} className="mb-10 space-y-3 rounded-2xl border border-[#8E6873]/20 bg-white p-4">
          <input
            type="text"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="اكتبها في سطر..."
            className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
            required
          />
          <div className="flex items-center justify-between">
            <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="text-xs" />
            <button type="submit" disabled={saving} className="rounded-lg bg-[#8E6873] px-4 py-1.5 text-sm text-white disabled:opacity-40">
              نحفظها
            </button>
          </div>
        </form>

        {moments.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[#40383A]">لسه مفيش لحظات محفوظة.</p>
            <p className="mt-1 text-sm text-[#8B8182]">أول لحظة ممكن تتحفظ دلوقتي.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {moments.map((moment) => (
              <li key={moment.id} className="group rounded-xl border border-[#8E6873]/10 bg-white/70 px-4 py-3">
                <p className="text-xs text-[#8B8182]">
                  {new Date(moment.occurred_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                </p>
                <p className="mt-1 text-[#40383A]">«{moment.content}»</p>
                {moment.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={moment.photo_url} alt="" className="mt-2 w-28 rounded" />
                )}
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-[10px] text-[#8B8182]">{moment.author_name}</p>
                  <button
                    onClick={() => removeMoment(moment.id)}
                    className="text-[10px] text-[#8B8182] opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
