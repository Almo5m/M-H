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
    <div className="page-fade-in flex min-h-screen items-center justify-center bg-[#F7F1E8] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm soft-panel p-8 text-center">
        <p className="mb-6 font-arDisplay text-2xl text-[#40383A]">عالمنا</p>

        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="الإيميل"
          className="mb-3 w-full rounded-xl border border-[#8E6873]/20 bg-[#F7F1E8] px-4 py-3 text-center text-[#40383A] outline-none focus:border-[#8E6873]/50"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="الباسورد"
          className="mb-4 w-full rounded-xl border border-[#8E6873]/20 bg-[#F7F1E8] px-4 py-3 text-center text-[#40383A] outline-none focus:border-[#8E6873]/50"
          required
        />

        {error && <p className="mb-3 text-sm text-[#8E6873]">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'لحظة...' : 'ادخل'}
        </button>
      </form>
    </div>
  );
}
