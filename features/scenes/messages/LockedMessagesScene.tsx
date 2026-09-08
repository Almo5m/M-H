'use client';

import { useEffect, useState } from 'react';
import type { LockedMessage } from '@/lib/types';
import { SealedEnvelope } from '@/features/effects/SealedEnvelope';

export function LockedMessagesScene() {
  const [unlocked, setUnlocked] = useState<LockedMessage[]>([]);
  const [justUnlockedIds, setJustUnlockedIds] = useState<string[]>([]);
  const [lockedCount, setLockedCount] = useState(0);
  const [content, setContent] = useState('');
  const [unlockAt, setUnlockAt] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const response = await fetch('/api/messages');
    const data = await response.json();
    setUnlocked(data.unlocked ?? []);
    setJustUnlockedIds(data.justUnlockedIds ?? []);
    setLockedCount(data.lockedCount ?? 0);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim() || !unlockAt) return;
    setSaving(true);

    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), unlockAt: new Date(unlockAt).toISOString() }),
    });

    if (response.ok) {
      setContent('');
      setUnlockAt('');
    }
    setSaving(false);
  }

  return (
    <section id="locked-messages" data-blocking="true" className="flex min-h-screen flex-col items-center gap-8 bg-deep px-6 py-16 text-warmWhite">
      <h2 className="font-arDisplay text-2xl">رسايل مؤجلة</h2>

      {justUnlockedIds.length > 0 && (
        <p className="animate-pulse rounded-xl bg-goldSoft px-4 py-2 text-deep">
          ✨ وصلتلك رسالة كانت مقفولة، اتفتحت دلوقتي!
        </p>
      )}

      {unlocked.length > 0 && (
        <ul className="w-full max-w-md space-y-4">
          {unlocked.map((message) => (
            <li key={message.id}>
              <SealedEnvelope
                content={message.content}
                date={new Date(message.unlock_at).toLocaleDateString('ar-EG')}
              />
            </li>
          ))}
        </ul>
      )}

      {lockedCount > 0 && (
        <p className="text-sm text-inkSoft">
          فيه {lockedCount} رسالة لسه متقفلة، هتتفتح في وقتها.
        </p>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="اكتب/اكتبي رسالة..."
          className="w-full rounded-xl bg-deep2 p-4 text-warmWhite outline-none"
          rows={3}
          required
        />
        <input
          type="datetime-local"
          value={unlockAt}
          onChange={(event) => setUnlockAt(event.target.value)}
          className="w-full rounded-xl bg-deep2 p-3 text-warmWhite outline-none"
          required
        />
        <button type="submit" disabled={saving} className="w-full rounded-xl bg-roseDeep py-2 text-warmWhite disabled:opacity-40">
          {saving ? 'بتتقفل...' : 'اقفلها لحد ميعادها'}
        </button>
      </form>
    </section>
  );
}
