'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { BackToHub } from '@/features/hub/BackToHub';
import { CATEGORY_ORDER, ARABIC_LETTERS, type CategoryAnswers } from '@/lib/games/categories';

interface Match {
  id: string;
  state: {
    letter: string;
    status: 'answering' | 'scoring' | 'finished';
    answers: Record<string, CategoryAnswers>;
    scores: Record<string, Record<string, 0 | 5 | 10>>;
    doneBy: string | null;
  };
  winner_user_id: string | null;
}

export function CategoriesPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [letter, setLetter] = useState(ARABIC_LETTERS[Math.floor(Math.random() * ARABIC_LETTERS.length)]);
  const [answers, setAnswers] = useState<CategoryAnswers>({});
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  async function load() {
    const response = await fetch('/api/games/categories/match');
    const data = await response.json();
    setMatch(data.match);
    setMyId(data.myId);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!match?.id) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`categories-${match.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_matches', filter: `id=eq.${match.id}` },
        (payload) => setMatch(payload.new as Match),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id]);

  // When the partner clicks "خلصت" first, my answering phase gets locked —
  // auto-submit whatever I'd typed so far.
  useEffect(() => {
    if (match?.state.status === 'scoring' && !autoSubmitted && myId && match.state.doneBy !== myId) {
      setAutoSubmitted(true);
      fetch('/api/games/categories/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match.id, answers, finishing: false }),
      });
    }
  }, [match?.state.status, match?.state.doneBy, myId, autoSubmitted, answers, match?.id]);

  async function startRound() {
    const response = await fetch('/api/games/categories/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ letter }),
    });
    const data = await response.json();
    if (response.ok) {
      setMatch(data.match);
      setAnswers({});
      setAutoSubmitted(false);
    }
  }

  async function finish() {
    if (!match) return;
    await fetch('/api/games/categories/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, answers, finishing: true }),
    });
  }

  async function setScore(userId: string, category: string, points: 0 | 5 | 10) {
    if (!match) return;
    await fetch('/api/games/categories/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, userId, category, points }),
    });
  }

  const otherId = useMemo(() => {
    if (!match || !myId) return null;
    return Object.keys(match.state.answers).find((id) => id !== myId) ?? null;
  }, [match, myId]);

  if (!match || match.state.status === 'finished') {
    const finished = match?.state.status === 'finished';
    let resultLine: string | null = null;
    if (finished && match && myId) {
      resultLine = match.winner_user_id ? (match.winner_user_id === myId ? 'كسبتي! 🎉' : 'كسبت هي المرادي 🤍') : 'تعادل!';
    }

    return (
      <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
        <BackToHub />
        <div className="mx-auto max-w-sm text-center">
          <p className="font-arDisplay text-3xl text-[#40383A]">أتوبيس كومبليت</p>
          {resultLine && <p className="my-4 text-[#8E6873]">{resultLine}</p>}

          <p className="mt-6 mb-2 text-sm text-[#8B8182]">اختاروا الحرف</p>
          <div className="mb-6 flex flex-wrap justify-center gap-1.5">
            {ARABIC_LETTERS.map((letterOption) => (
              <button
                key={letterOption}
                onClick={() => setLetter(letterOption)}
                className={`h-9 w-9 rounded-full text-sm ${letter === letterOption ? 'bg-[#8E6873] text-white' : 'bg-white text-[#40383A]'}`}
              >
                {letterOption}
              </button>
            ))}
          </div>

          <button onClick={startRound} className="btn-primary">
            {finished ? 'جولة تانية' : 'ابدأ اللعبة'}
          </button>
        </div>
      </main>
    );
  }

  if (match.state.status === 'answering') {
    return (
      <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
        <BackToHub />
        <div className="mx-auto max-w-sm">
          <p className="text-center font-arDisplay text-3xl text-[#40383A]">أتوبيس كومبليت</p>
          <p className="mb-6 text-center text-sm text-[#8B8182]">الحرف: {match.state.letter}</p>

          <div className="space-y-3">
            {CATEGORY_ORDER.map((category) => (
              <div key={category.key}>
                <label className="mb-1 block text-xs text-[#8B8182]">{category.label}</label>
                <input
                  type="text"
                  value={answers[category.key] ?? ''}
                  onChange={(event) => setAnswers((current) => ({ ...current, [category.key]: event.target.value }))}
                  className="field-input"
                />
              </div>
            ))}
          </div>

          <button onClick={finish} className="btn-primary mt-6 w-full">
            خلصت
          </button>
        </div>
      </main>
    );
  }

  // scoring phase
  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-md">
        <p className="text-center font-arDisplay text-3xl text-[#40383A]">قارنوا الإجابات</p>
        <p className="mb-6 text-center text-sm text-[#8B8182]">حطوا نقط كل إجابة سوا (٠ / ٥ / ١٠)</p>

        <div className="space-y-4">
          {CATEGORY_ORDER.map((category) => (
            <div key={category.key} className="soft-card p-4">
              <p className="mb-2 text-sm text-[#8E6873]">{category.label}</p>
              {[myId, otherId].map((userId, index) =>
                userId ? (
                  <div key={userId} className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-[#40383A]">
                      {index === 0 ? 'أنا' : 'الطرف التاني'}: {match.state.answers[userId]?.[category.key] || '—'}
                    </span>
                    <div className="flex gap-1">
                      {[0, 5, 10].map((points) => (
                        <button
                          key={points}
                          onClick={() => setScore(userId, category.key, points as 0 | 5 | 10)}
                          className={`btn-chip ${
                            match.state.scores[userId]?.[category.key] === points
                              ? 'bg-[#8E6873] text-white'
                              : 'bg-[#F7F1E8] text-[#40383A]'
                          }`}
                        >
                          {points}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
