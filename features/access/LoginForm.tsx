'use client';

import { useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('البيانات مش مظبوطة.');
      setLoading(false);
      return;
    }

    window.location.href = '/unlock';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-rose/30 bg-warmWhite p-8 text-center shadow-lg"
      >
        <p className="mb-6 font-arDisplay text-2xl text-ink">عالمنا</p>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="الإيميل"
          className="mb-3 w-full rounded-xl border border-rose/40 bg-cream px-4 py-3 text-center text-ink outline-none focus:border-roseDeep"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="الباسورد"
          className="mb-4 w-full rounded-xl border border-rose/40 bg-cream px-4 py-3 text-center text-ink outline-none focus:border-roseDeep"
          required
        />

        {error && <p className="mb-3 text-sm text-roseDeep">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-roseDeep py-3 text-warmWhite transition disabled:opacity-40"
        >
          {loading ? 'لحظة...' : 'ادخل'}
        </button>
      </form>
    </div>
  );
}
