'use client';

import { useEffect, useState } from 'react';

interface Surprise {
  id: string;
  content_type: 'text' | 'photo';
  text_content: string | null;
  photo_url: string | null;
  reveal_at: string;
  revealed_at: string | null;
}

function countdownParts(target: Date) {
  const diffMs = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return { days, hours, minutes };
}

export function SurprisePage() {
  const [ready, setReady] = useState<Surprise[]>([]);
  const [waitingCount, setWaitingCount] = useState(0);
  const [nearestWaitingAt, setNearestWaitingAt] = useState<string | null>(null);
  const [mine, setMine] = useState<Surprise[]>([]);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [contentType, setContentType] = useState<'text' | 'photo'>('text');
  const [textContent, setTextContent] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [revealAt, setRevealAt] = useState('');
  const [, forceTick] = useState(0);

  async function load() {
    const response = await fetch('/api/surprises');
    const data = await response.json();
    setReady(data.ready ?? []);
    setWaitingCount(data.waitingCount ?? 0);
    setNearestWaitingAt(data.nearestWaitingAt ?? null);
    setMine(data.mine ?? []);
  }

  useEffect(() => {
    load();
    const interval = setInterval(() => forceTick((tick) => tick + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!revealAt) return;

    const formData = new FormData();
    formData.append('contentType', contentType);
    formData.append('revealAt', new Date(revealAt).toISOString());
    if (contentType === 'text') formData.append('textContent', textContent);
    if (contentType === 'photo' && photo) formData.append('photo', photo);

    const response = await fetch('/api/surprises', { method: 'POST', body: formData });
    if (response.ok) {
      setTextContent('');
      setPhoto(null);
      setRevealAt('');
      setShowForm(false);
      load();
    }
  }

  const countdown = nearestWaitingAt ? countdownParts(new Date(nearestWaitingAt)) : null;
  const openedSurprise = ready.find((surprise) => surprise.id === openedId);

  return (
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-8 flex items-baseline justify-between text-right">
          <div>
            <p className="font-arDisplay text-3xl text-[#40383A]">مفاجأة</p>
            <p className="text-[#8E6873]">في حاجة مستنياك في وقتها.</p>
          </div>
          <button onClick={() => setShowForm((value) => !value)} className="text-sm text-[#8E6873] underline decoration-dotted">
            + أجهز مفاجأة
          </button>
        </div>

        {openedSurprise ? (
          <div className="animate-[surprise-open_0.6s_ease-out] rounded-2xl border border-[#C7A96B]/30 bg-white p-8">
            {openedSurprise.content_type === 'text' ? (
              <p className="text-lg text-[#40383A]">{openedSurprise.text_content}</p>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={openedSurprise.photo_url ?? ''} alt="" className="mx-auto max-h-80 rounded" />
            )}
            <p className="mt-6 text-sm text-[#8E6873]">وصلت. 🤍</p>
            <button onClick={() => setOpenedId(null)} className="mt-4 text-xs text-[#8B8182]">
              رجوع
            </button>
            <style>{`
              @keyframes surprise-open { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
            `}</style>
          </div>
        ) : (
          <>
            {ready.length > 0 ? (
              <div className="mb-8 space-y-3">
                {ready.map((surprise) => (
                  <button
                    key={surprise.id}
                    onClick={() => setOpenedId(surprise.id)}
                    className="w-full rounded-2xl border border-[#C7A96B]/40 bg-white px-6 py-8 text-[#40383A] shadow-sm"
                  >
                    في مفاجأة مستنياك 🎁
                  </button>
                ))}
              </div>
            ) : waitingCount > 0 ? (
              <div className="mb-8 rounded-2xl border border-[#8E6873]/15 bg-white px-6 py-10">
                <svg viewBox="0 0 40 40" className="mx-auto mb-4 h-12 w-12 text-[#B99AA1]" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <rect x="9" y="16" width="22" height="16" rx="1.5" />
                  <path d="M9 16 L31 16 M20 16 L20 32" />
                  <path d="M15 16 C15 11, 18 9, 20 12 C22 9, 25 11, 25 16" />
                </svg>
                <p className="text-[#40383A]">في مفاجأة مستنياك</p>
                {countdown && (
                  <p className="mt-2 text-sm text-[#8B8182]">
                    {countdown.days} أيام · {countdown.hours} ساعات · {countdown.minutes} دقيقة
                  </p>
                )}
              </div>
            ) : (
              <p className="mb-8 py-16 text-[#8B8182]">مفيش مفاجآت مستنية دلوقتي. بس ممكن تجهز واحدة.</p>
            )}

            {mine.length > 0 && (
              <div className="text-right">
                <p className="mb-2 text-sm text-[#8B8182]">مفاجآتي</p>
                <ul className="space-y-2">
                  {mine.map((surprise) => (
                    <li key={surprise.id} className="rounded-xl bg-white/60 px-4 py-2 text-xs text-[#8B8182]">
                      {surprise.revealed_at ? 'اتفتحت' : 'مستنية'} · {new Date(surprise.reveal_at).toLocaleDateString('ar-EG')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-3 rounded-2xl border border-[#8E6873]/20 bg-white p-6 text-right">
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => setContentType('text')} className={`rounded-full px-3 py-1 ${contentType === 'text' ? 'bg-[#8E6873] text-white' : 'bg-[#F7F1E8] text-[#40383A]'}`}>
                رسالة
              </button>
              <button type="button" onClick={() => setContentType('photo')} className={`rounded-full px-3 py-1 ${contentType === 'photo' ? 'bg-[#8E6873] text-white' : 'bg-[#F7F1E8] text-[#40383A]'}`}>
                صورة
              </button>
            </div>

            {contentType === 'text' ? (
              <textarea
                value={textContent}
                onChange={(event) => setTextContent(event.target.value)}
                placeholder="اكتب المفاجأة..."
                className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
                rows={3}
                required
              />
            ) : (
              <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="text-sm" required />
            )}

            <p className="text-sm text-[#40383A]">إمتى تظهر؟</p>
            <input
              type="datetime-local"
              value={revealAt}
              onChange={(event) => setRevealAt(event.target.value)}
              className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
              required
            />
            <button type="submit" className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white">
              نجهزها
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
