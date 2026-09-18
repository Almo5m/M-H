'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { GameShell } from '../GameShell';

interface Match {
  id: string;
  state: { board: (string | null)[]; symbols: Record<string, 'X' | 'O'> };
  status: 'active' | 'finished';
  turn_user_id: string | null;
  winner_user_id: string | null;
}

export function TicTacToePage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  async function load() {
    const response = await fetch('/api/games/tic-tac-toe/match');
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
      .channel(`tic-tac-toe-${match.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_matches', filter: `id=eq.${match.id}` },
        (payload) => setMatch(payload.new as Match),
      )
      .subscribe();
    const interval = setInterval(load, 2500);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [match?.id]);

  async function startGame() {
    setStarting(true);
    const response = await fetch('/api/games/tic-tac-toe/start', { method: 'POST' });
    const data = await response.json();
    if (response.ok) setMatch(data.match);
    setStarting(false);
  }

  async function playCell(index: number) {
    if (!match) return;
    const response = await fetch('/api/games/tic-tac-toe/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, cellIndex: index }),
    });
    const data = await response.json();
    if (response.ok && data.match) setMatch(data.match);
  }

  if (!match || match.status === 'finished') {
    const finished = match?.status === 'finished';
    return (
      <GameShell title="X O">
        <div className="mx-auto max-w-sm text-center">
          {finished && myId && (
            <p className="mb-6 text-lg text-[#E3C567]">
              {match!.winner_user_id ? (match!.winner_user_id === myId ? 'كسبت! 🎉' : 'كسبت هي المرادي 🤍') : 'تعادل!'}
            </p>
          )}
          <button onClick={startGame} disabled={starting} className="game-btn">
            {finished ? 'نلعب تاني' : 'ابدأ لعبة'}
          </button>
        </div>
      </GameShell>
    );
  }

  const mySymbol = myId ? match.state.symbols[myId] : null;
  const myTurn = match.turn_user_id === myId;

  return (
    <GameShell title="X O">
      <div className="mx-auto max-w-xs text-center">
        <p className="mb-6 text-sm text-white/60">
          إنتي {mySymbol} — {myTurn ? 'دورك' : 'مستنيين الطرف التاني'}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {match.state.board.map((cell, index) => (
            <button
              key={index}
              onClick={() => myTurn && !cell && playCell(index)}
              className="flex h-20 items-center justify-center rounded-2xl border border-white/20 bg-white/15 font-arDisplay text-3xl text-[#E3C567] shadow-inner backdrop-blur transition hover:bg-white/20 disabled:hover:bg-white/15"
              disabled={!myTurn || Boolean(cell)}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
