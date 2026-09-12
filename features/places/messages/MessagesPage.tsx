'use client';

import { useEffect, useState } from 'react';

interface Message {
  id: string;
  content: string;
  delivery_mode: string;
  unlock_at: string | null;
  created_at: string;
}

export function MessagesPage() {
  const [received, setReceived] = useState<Message[]>([]);
  const [waiting, setWaiting] = useState<Message[]>([]);
  const [written, setWritten] = useState<Message[]>([]);
  const [justUnlockedIds, setJustUnlockedIds] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'now' | 'scheduled'>('now');
  const [unlockAt, setUnlockAt] = useState('');
  const [openedId, setOpenedId] = useState<string | null>(null);

  async function load() {
    const response = await fetch('/api/messages');
    const data = await response.json();
    setReceived(data.received ?? []);
    setWaiting(data.waiting ?? []);
    setWritten(data.written ?? []);
    setJustUnlockedIds(data.justUnlockedIds ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim() || (mode === 'scheduled' && !unlockAt)) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), deliveryMode: mode, unlockAt: unlockAt ? new Date(unlockAt).toISOString() : undefined }),
    });
    setContent('');
    setUnlockAt('');
    load();
  }

  return (
    <main className="min-h-screen bg-[#F7F1E8] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <p className="font-arDisplay text-3xl text-[#40383A]">رسالة</p>
        <p className="mb-10 text-[#8E6873]">في كلام بيستنى وقته.</p>

        {justUnlockedIds.length > 0 && (
          <p className="mb-6 rounded-lg bg-[#C7A96B]/20 px-4 py-2 text-sm text-[#40383A]">شكلها جه وقتها. 🤍</p>
        )}

        <section className="mb-8">
          <p className="mb-2 text-sm text-[#8B8182]">وصلتني</p>
          {received.length === 0 && <p className="text-sm text-[#8B8182]">مفيش رسالة لسه.</p>}
          <ul className="space-y-2">
            {received.map((message) => (
              <li key={message.id} className="rounded-xl border border-[#8E6873]/15 bg-white px-4 py-3">
                {openedId === message.id ? (
                  <>
                    <p className="text-[#40383A]">{message.content}</p>
                    <p className="mt-2 text-right text-xs text-[#8E6873]">وصلتني. 🤍</p>
                  </>
                ) : (
                  <button onClick={() => setOpenedId(message.id)} className="w-full text-right text-sm text-[#40383A]">
                    «{message.content.slice(0, 24)}…»
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-8">
          <p className="mb-2 text-sm text-[#8B8182]">مستنية وقتها</p>
          {waiting.length === 0 && <p className="text-sm text-[#8B8182]">مفيش حاجة مستنية دلوقتي.</p>}
          <ul className="space-y-2">
            {waiting.map((message) => (
              <li key={message.id} className="rounded-xl border border-dashed border-[#8E6873]/30 bg-white/60 px-4 py-3 text-sm text-[#8B8182]">
                لسه وقتها مجاش · {new Date(message.unlock_at!).toLocaleDateString('ar-EG')}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <p className="mb-2 text-sm text-[#8B8182]">كتبتها</p>
          <ul className="space-y-2">
            {written.map((message) => (
              <li key={message.id} className="rounded-xl bg-white/50 px-4 py-2 text-xs text-[#8B8182]">
                «{message.content.slice(0, 30)}…»
              </li>
            ))}
          </ul>
        </section>

        <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-[#8E6873]/20 bg-white p-6">
          <p className="text-sm text-[#40383A]">اكتب اللي نفسك تقوله...</p>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
            rows={3}
            required
          />
          <div className="flex gap-2 text-sm">
            <button type="button" onClick={() => setMode('now')} className={`rounded-full px-3 py-1 ${mode === 'now' ? 'bg-[#8E6873] text-white' : 'bg-[#F7F1E8] text-[#40383A]'}`}>
              الآن
            </button>
            <button type="button" onClick={() => setMode('scheduled')} className={`rounded-full px-3 py-1 ${mode === 'scheduled' ? 'bg-[#8E6873] text-white' : 'bg-[#F7F1E8] text-[#40383A]'}`}>
              بعدين
            </button>
          </div>
          {mode === 'scheduled' && (
            <input
              type="datetime-local"
              value={unlockAt}
              onChange={(event) => setUnlockAt(event.target.value)}
              className="w-full rounded-lg border border-[#8E6873]/20 bg-[#F7F1E8] px-3 py-2 text-sm outline-none"
              required
            />
          )}
          <button type="submit" className="w-full rounded-lg bg-[#8E6873] py-2 text-sm text-white">
            نبعتها
          </button>
        </form>
      </div>
    </main>
  );
}
