'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { GameShell } from '../GameShell';
import { LudoBoard3D } from './LudoBoard3D';
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
  const [rollTrigger, setRollTrigger] = useState(0);

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
    const interval = setInterval(load, 2500);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
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
    setRollTrigger((value) => value + 1);
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
      <GameShell title="ليدو">
        <div className="mx-auto max-w-sm text-center">
          {resultLine && <p className="mb-6 text-lg text-[#E3C567]">{resultLine}</p>}
          <button onClick={startGame} className="game-btn">
            {finished ? 'لعبة تانية' : 'ابدأ اللعبة'}
          </button>
        </div>
      </GameShell>
    );
  }

  const myTurn = match.turn_user_id === myId;
  const otherId = Object.keys(match.state.colors).find((id) => id !== myId)!;
  const myColor = myId ? match.state.colors[myId] : null;
  const canRoll = myTurn && match.state.phase === 'roll';

  return (
    <GameShell title="ليدو">
      <div className="mx-auto max-w-md text-center">
        <p className="mb-4 text-sm text-white/60">
          إنتي {myColor === 'red' ? 'الأحمر' : 'الأصفر'} — {myTurn ? 'دورك' : 'مستنيين الطرف التاني'}
        </p>

        {flash && <p className="mb-3 text-[#E3C567]">{flash}</p>}
        {error && <p className="mb-3 text-sm text-[#e08787]">{error}</p>}

        {myId && (
          <LudoBoard3D
            colors={match.state.colors}
            tokens={match.state.tokens}
            myId={myId}
            otherId={otherId}
            movableIndices={movable}
            onTokenClick={moveToken}
            diceValue={match.state.diceValue}
            rollTrigger={rollTrigger}
          />
        )}

        <div className="mt-6 flex flex-col items-center gap-2">
          <button onClick={rollDice} disabled={!canRoll || rolling} className="game-btn">
            {rolling ? '...' : 'ارمي النرد'}
          </button>
          {match.state.phase === 'move' && myTurn && movable.length > 0 && (
            <p className="text-xs text-white/50">دوسي على عسكري مضيء عشان تحركيه</p>
          )}
        </div>
      </div>
    </GameShell>
  );
}
