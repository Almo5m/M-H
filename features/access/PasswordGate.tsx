'use client';

import { useState } from 'react';
import type { Partner } from '@/lib/types';

export function PasswordGate() {
  const [who, setWho] = useState<Partner | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!who) return;
    setLoading(true);
    setError(null);

    const response = await fetch('/api/access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, who }),
    });

    if (response.ok) {
      window.location.reload();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'حصل خطأ، جربي تاني.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-rose/30 bg-warmWhite p-8 text-center shadow-lg"
      >
        <p className="mb-6 font-arDisplay text-2xl text-ink">عالمنا الخاص</p>

        <p className="mb-3 text-sm text-inkSoft">إنتي مين؟</p>
        <div className="mb-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setWho('moaz')}
            className={`rounded-full px-5 py-2 text-sm transition ${
              who === 'moaz' ? 'bg-roseDeep text-warmWhite' : 'bg-blush text-ink'
            }`}
          >
            معاذ
          </button>
          <button
            type="button"
            onClick={() => setWho('hanona')}
            className={`rounded-full px-5 py-2 text-sm transition ${
              who === 'hanona' ? 'bg-roseDeep text-warmWhite' : 'bg-blush text-ink'
            }`}
          >
            حنونة
          </button>
        </div>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="الباسورد"
          className="mb-4 w-full rounded-xl border border-rose/40 bg-cream px-4 py-3 text-center text-ink outline-none focus:border-roseDeep"
        />

        {error && <p className="mb-3 text-sm text-roseDeep">{error}</p>}

        <button
          type="submit"
          disabled={!who || !password || loading}
          className="w-full rounded-xl bg-roseDeep py-3 text-warmWhite transition disabled:opacity-40"
        >
          {loading ? 'لحظة...' : 'ادخلي'}
        </button>
      </form>
    </div>
  );
}
