'use client';

import { BackToHub } from '@/features/hub/BackToHub';
import { FileUploadField } from '@/components/ui/FileUploadField';

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
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-8 flex items-baseline justify-between text-right">
          <div>
            <p className="font-arDisplay text-3xl text-[#40383A]">مفاجأة</p>
            <p className="text-[#8E6873]">في حاجة مستنياك في وقتها.</p>
          </div>
          <button onClick={() => setShowForm((value) => !value)} className="btn-ghost">
            + أجهز مفاجأة
          </button>
        </div>

        {openedSurprise ? (
          <div className="animate-[surprise-open_0.6s_ease-out] soft-panel p-8">
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
                    className="w-full soft-panel px-6 py-8 text-[#40383A] shadow-[0_4px_24px_rgba(199,169,107,0.2)] transition-transform duration-300 hover:-translate-y-1"
                  >
                    في مفاجأة مستنياك 🎁
                  </button>
                ))}
              </div>
            ) : waitingCount > 0 ? (
              <div className="mb-8 soft-panel px-6 py-10">
                <svg viewBox="0 0 40 40" className="mx-auto mb-4 h-12 w-12">
                  <rect x="9" y="18" width="22" height="14" rx="2.5" fill="#C7A96B" />
                  <rect x="9" y="13" width="22" height="6" rx="2" fill="#8E6873" />
                  <rect x="18" y="13" width="4" height="19" fill="#FFFBF6" opacity="0.5" />
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
                    <li key={surprise.id} className="list-item-enter soft-card px-4 py-2 text-xs text-[#8B8182]">
                      {surprise.revealed_at ? 'اتفتحت' : 'مستنية'} · {new Date(surprise.reveal_at).toLocaleDateString('ar-EG')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-3 soft-panel p-6 text-right">
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
                className="field-input"
                rows={3}
                required
              />
            ) : (
              <FileUploadField label="اختار صورة" accept="image/*" file={photo} onChange={setPhoto} />
            )}

            <p className="text-sm text-[#40383A]">إمتى تظهر؟</p>
            <input
              type="datetime-local"
              value={revealAt}
              onChange={(event) => setRevealAt(event.target.value)}
              className="field-input"
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
