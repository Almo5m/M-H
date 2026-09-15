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
    <div className="page-fade-in flex min-h-screen items-center justify-center bg-[#F7F1E8] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm soft-panel p-8 text-center">
        <p className="mb-6 font-arDisplay text-2xl text-[#40383A]">مساحتنا</p>
        <p className="mb-4 text-sm text-[#8B8182]">الكلمة اللي بينا بس</p>

        <input
          type="password"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          placeholder="..."
          className="mb-4 w-full rounded-xl border border-[#8E6873]/20 bg-[#F7F1E8] px-4 py-3 text-center text-[#40383A] outline-none focus:border-[#8E6873]/50"
          required
        />

        {error && <p className="mb-3 text-sm text-[#8E6873]">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'لحظة...' : 'ادخلي'}
        </button>
      </form>
    </div>
  );
}
