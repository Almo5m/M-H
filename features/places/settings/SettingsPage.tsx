'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import type { CurrentUser } from '@/lib/auth';

export function SettingsPage({ user }: { user: CurrentUser }) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/space-settings')
      .then((response) => response.json())
      .then((data) => setRelationshipStartDate(data.relationshipStartDate ?? ''));
  }, []);

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    setSavingName(true);
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: displayName.trim() }),
    });
    setSavingName(false);
    setSavedMessage('اتحفظ.');
    setTimeout(() => setSavedMessage(null), 2000);
  }

  async function saveDate(event: React.FormEvent) {
    event.preventDefault();
    setSavingDate(true);
    await fetch('/api/space-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relationshipStartDate }),
    });
    setSavingDate(false);
    setSavedMessage('اتحفظ.');
    setTimeout(() => setSavedMessage(null), 2000);
  }

  async function logout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <Link href="/" className="fixed left-4 top-4 rounded-full bg-[#FFFBF6]/90 px-4 py-2 text-sm text-[#40383A] shadow">
        ← الرئيسية
      </Link>

      <div className="mx-auto max-w-sm">
        <p className="mb-10 font-arDisplay text-3xl text-[#40383A]">الإعدادات</p>

        <form onSubmit={saveName} className="mb-8 space-y-2">
          <p className="text-sm text-[#8B8182]">اسمك</p>
          <input
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full rounded-lg border border-[#8E6873]/20 bg-white px-3 py-2 text-sm outline-none"
          />
          <button type="submit" disabled={savingName} className="btn-primary">
            حفظ
          </button>
        </form>

        <form onSubmit={saveDate} className="mb-8 space-y-2">
          <p className="text-sm text-[#8B8182]">من إمتى إحنا مع بعض</p>
          <input
            type="date"
            value={relationshipStartDate}
            onChange={(event) => setRelationshipStartDate(event.target.value)}
            className="w-full rounded-lg border border-[#8E6873]/20 bg-white px-3 py-2 text-sm outline-none"
          />
          <button type="submit" disabled={savingDate} className="btn-primary">
            حفظ
          </button>
        </form>

        {savedMessage && <p className="mb-6 text-sm text-[#8E6873]">{savedMessage}</p>}

        <button onClick={logout} className="text-sm text-[#8B8182] underline decoration-dotted">
          تسجيل خروج
        </button>
      </div>
    </main>
  );
}
