'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { BackToHub } from '@/features/hub/BackToHub';
import { LudoBoard } from './LudoBoard';
import type { LudoColor } from '@/lib/games/ludo';

interface Match {
  id: string;
  state: {
    colors: Record<string, LudoColor>;
    tokens: Record<string, number[]>;
    diceValue: number | null;
    phase: 'roll' | 'move';
  };
  status: 'active' | 'finished';
  turn_user_id: string | null;
  winner_user_id: string | null;
}

export function LudoPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [movable, setMovable] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  async function load() {
    const response = await fetch('/api/games/ludo/match');
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
      .channel(`ludo-${match.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_matches', filter: `id=eq.${match.id}` },
        (payload) => {
          setMatch(payload.new as Match);
          setMovable([]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id]);

  async function startGame() {
    const response = await fetch('/api/games/ludo/start', { method: 'POST' });
    const data = await response.json();
    if (response.ok) setMatch(data.match);
  }

  async function rollDice() {
    if (!match) return;
    setError(null);
    setRolling(true);
    const response = await fetch('/api/games/ludo/roll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id }),
    });
    const data = await response.json();
    setRolling(false);
    if (!response.ok) {
      setError(data.error ?? 'حصلت مشكلة.');
      return;
    }
    if (data.passed) {
      setFlash(`نرد ${data.diceValue} — مفيش حركة، دور الطرف التاني`);
      setTimeout(() => setFlash(null), 2500);
      load();
    } else {
      setMovable(data.movable ?? []);
    }
  }

  async function moveToken(tokenIndex: number) {
    if (!match) return;
    setError(null);
    const response = await fetch('/api/games/ludo/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, tokenIndex }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? 'حصلت مشكلة.');
      return;
    }
    if (data.captured) {
      setFlash('كلتيها! 🎯');
      setTimeout(() => setFlash(null), 2000);
    }
    setMovable([]);
    load();
  }

  if (!match || match.status === 'finished') {
    const finished = match?.status === 'finished';
    let resultLine: string | null = null;
    if (finished && match && myId) {
      resultLine = match.winner_user_id === myId ? 'كسبتي! 🎉' : 'كسبت هي المرادي 🤍';
    }
    return (
      <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
        <BackToHub />
        <div className="mx-auto max-w-sm text-center">
          <p className="font-arDisplay text-3xl text-[#40383A]">ليدو</p>
          {resultLine && <p className="my-4 text-[#8E6873]">{resultLine}</p>}
          <button onClick={startGame} className="btn-primary mt-6">
            {finished ? 'لعبة تانية' : 'ابدأ اللعبة'}
          </button>
        </div>
      </main>
    );
  }

  const myTurn = match.turn_user_id === myId;
  const otherId = Object.keys(match.state.colors).find((id) => id !== myId)!;
  const myColor = myId ? match.state.colors[myId] : null;
  const canRoll = myTurn && match.state.phase === 'roll';

  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-md text-center">
        <p className="font-arDisplay text-3xl text-[#40383A]">ليدو</p>
        <p className="mb-4 text-sm text-[#8B8182]">
          إنتي {myColor === 'red' ? 'الأحمر' : 'الأصفر'} — {myTurn ? 'دورك' : 'مستنيين الطرف التاني'}
        </p>

        {flash && <p className="mb-3 text-[#C7A96B]">{flash}</p>}
        {error && <p className="mb-3 text-sm text-[#8E6873]">{error}</p>}

        {myId && (
          <LudoBoard
            colors={match.state.colors}
            tokens={match.state.tokens}
            myId={myId}
            otherId={otherId}
            movableIndices={movable}
            onTokenClick={moveToken}
          />
        )}

        <div className="mt-6 flex flex-col items-center gap-2">
          {match.state.diceValue !== null && (
            <p className="font-arDisplay text-2xl text-[#8E6873]">🎲 {match.state.diceValue}</p>
          )}
          <button onClick={rollDice} disabled={!canRoll || rolling} className="btn-primary">
            {rolling ? '...' : 'ارمي النرد'}
          </button>
          {match.state.phase === 'move' && myTurn && movable.length > 0 && (
            <p className="text-xs text-[#8B8182]">دوسي على عسكري مضيء عشان تحركيه</p>
          )}
        </div>
      </div>
    </main>
  );
}
