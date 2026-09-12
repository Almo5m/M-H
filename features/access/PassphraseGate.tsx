'use client';

import { useState } from 'react';

export function PassphraseGate() {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch('/api/passphrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passphrase }),
    });

    if (response.ok) {
      window.location.href = '/';
    } else {
      setError('مش هي.');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-rose/30 bg-warmWhite p-8 text-center shadow-lg"
      >
        <p className="mb-6 font-arDisplay text-2xl text-ink">مساحتنا</p>
        <p className="mb-4 text-sm text-inkSoft">الكلمة اللي بينا بس</p>

        <input
          type="password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          placeholder="..."
          className="mb-4 w-full rounded-xl border border-rose/40 bg-cream px-4 py-3 text-center text-ink outline-none focus:border-roseDeep"
          required
        />

        {error && <p className="mb-3 text-sm text-roseDeep">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-roseDeep py-3 text-warmWhite transition disabled:opacity-40"
        >
          {loading ? 'لحظة...' : 'ادخلي'}
        </button>
      </form>
    </div>
  );
}
