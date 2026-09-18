'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { GameShell } from '../GameShell';
import { CATEGORY_ORDER, ARABIC_LETTERS, type CategoryAnswers } from '@/lib/games/categories';

interface Match {
  id: string;
  state: {
    letter: string | null;
    status: 'picking' | 'answering' | 'scoring' | 'finished';
    answers: Record<string, CategoryAnswers>;
    scores: Record<string, Record<string, 0 | 5 | 10>>;
    doneBy: string | null;
  };
  winner_user_id: string | null;
}

export function CategoriesPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<CategoryAnswers>({});
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

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
    const interval = setInterval(load, 2500); // fallback in case Realtime lags
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [match?.id]);

  useEffect(() => {
    if (match?.state.status === 'scoring' && !autoSubmitted && myId && match.state.doneBy !== myId) {
      setAutoSubmitted(true);
      fetch('/api/games/categories/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match.id, answers, finishing: false }),
      })
        .then((response) => response.json())
        .then((data) => data.match && setMatch(data.match));
    }
  }, [match?.state.status, match?.state.doneBy, myId, autoSubmitted, answers, match?.id]);

  async function startRound() {
    setStartError(null);
    const response = await fetch('/api/games/categories/start', { method: 'POST' });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setMatch(data.match);
      setAnswers({});
      setAutoSubmitted(false);
    } else {
      setStartError(data.error ?? `خطأ (${response.status}) بلا تفاصيل.`);
    }
  }

  async function pickLetter(letter: string) {
    if (!match) return;
    const response = await fetch('/api/games/categories/pick-letter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, letter }),
    });
    const data = await response.json();
    if (data.match) setMatch(data.match);
  }

  async function begin() {
    if (!match) return;
    const response = await fetch('/api/games/categories/begin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id }),
    });
    const data = await response.json();
    if (data.match) setMatch(data.match);
  }

  async function finish() {
    if (!match) return;
    const response = await fetch('/api/games/categories/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, answers, finishing: true }),
    });
    const data = await response.json();
    if (data.match) setMatch(data.match);
  }

  async function setScore(userId: string, category: string, points: 0 | 5 | 10) {
    if (!match) return;
    const response = await fetch('/api/games/categories/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, userId, category, points }),
    });
    const data = await response.json();
    if (data.match) setMatch(data.match);
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
      <GameShell title="أتوبيس كومبليت">
        <div className="mx-auto max-w-sm text-center">
          {resultLine && <p className="mb-6 text-lg text-[#E3C567]">{resultLine}</p>}
          {startError && <p className="mb-4 text-sm text-[#e08787]">{startError}</p>}
          <button onClick={startRound} className="game-btn">
            {finished ? 'جولة تانية' : 'ابدأ اللعبة'}
          </button>
        </div>
      </GameShell>
    );
  }

  if (match.state.status === 'picking') {
    return (
      <GameShell title="أتوبيس كومبليت">
        <div className="mx-auto max-w-sm text-center">
          <p className="mb-4 text-sm text-white/60">اختاروا الحرف سوا</p>
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {ARABIC_LETTERS.map((letterOption) => (
              <button
                key={letterOption}
                onClick={() => pickLetter(letterOption)}
                className={`h-10 w-10 rounded-full text-sm transition ${
                  match.state.letter === letterOption ? 'bg-[#E3C567] text-[#241A2E]' : 'bg-white/10 text-white'
                }`}
              >
                {letterOption}
              </button>
            ))}
          </div>
          <button onClick={begin} disabled={!match.state.letter} className="game-btn disabled:opacity-30">
            ابدأ اللعبة
          </button>
        </div>
      </GameShell>
    );
  }

  if (match.state.status === 'answering') {
    return (
      <GameShell title="أتوبيس كومبليت">
        <div className="mx-auto max-w-sm">
          <div className="paper-sheet">
            <p className="mb-4 text-center text-sm text-[#8B8182]">الحرف: <span className="font-arDisplay text-xl text-[#40383A]">{match.state.letter}</span></p>
            <div className="space-y-4">
              {CATEGORY_ORDER.map((category) => (
                <div key={category.key} className="paper-line">
                  <label className="paper-line-label">{category.label}</label>
                  <input
                    type="text"
                    value={answers[category.key] ?? ''}
                    onChange={(event) => setAnswers((current) => ({ ...current, [category.key]: event.target.value }))}
                    className="paper-line-input"
                  />
                </div>
              ))}
            </div>
          </div>
          <button onClick={finish} className="game-btn mt-6 w-full">
            خلصت
          </button>
        </div>
      </GameShell>
    );
  }

  // scoring phase
  return (
    <GameShell title="قارنوا الإجابات">
      <div className="mx-auto max-w-md">
        <p className="mb-6 text-center text-sm text-white/60">حطوا نقط كل إجابة سوا (٠ / ٥ / ١٠)</p>

        <div className="space-y-4">
          {CATEGORY_ORDER.map((category) => (
            <div key={category.key} className="rounded-2xl bg-white/8 p-4 backdrop-blur">
              <p className="mb-2 text-sm text-[#E3C567]">{category.label}</p>
              {[myId, otherId].map((userId, index) =>
                userId ? (
                  <div key={userId} className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-white">
                      {index === 0 ? 'أنا' : 'الطرف التاني'}: {match.state.answers[userId]?.[category.key] || '—'}
                    </span>
                    <div className="flex gap-1">
                      {[0, 5, 10].map((points) => (
                        <button
                          key={points}
                          onClick={() => setScore(userId, category.key, points as 0 | 5 | 10)}
                          className={`h-7 w-9 rounded-full text-xs transition ${
                            match.state.scores[userId]?.[category.key] === points
                              ? 'bg-[#E3C567] text-[#241A2E]'
                              : 'bg-white/10 text-white'
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
    </GameShell>
  );
}
