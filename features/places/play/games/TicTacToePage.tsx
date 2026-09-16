'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { BackToHub } from '@/features/hub/BackToHub';

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

    return () => {
      supabase.removeChannel(channel);
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
    await fetch('/api/games/tic-tac-toe/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, cellIndex: index }),
    });
  }

  if (!match || match.status === 'finished') {
    const finished = match?.status === 'finished';
    return (
      <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
        <BackToHub />
        <div className="mx-auto max-w-sm text-center">
          <p className="font-arDisplay text-3xl text-[#40383A]">X O</p>
          {finished && myId && (
            <p className="my-4 text-[#8E6873]">
              {match!.winner_user_id ? (match!.winner_user_id === myId ? 'كسبت! 🎉' : 'كسبت هي/هو المرادي 🤍') : 'تعادل!'}
            </p>
          )}
          <button onClick={startGame} disabled={starting} className="btn-primary mt-6">
            {finished ? 'نلعب تاني' : 'ابدأ لعبة'}
          </button>
        </div>
      </main>
    );
  }

  const mySymbol = myId ? match.state.symbols[myId] : null;
  const myTurn = match.turn_user_id === myId;

  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-xs text-center">
        <p className="font-arDisplay text-3xl text-[#40383A]">X O</p>
        <p className="mb-6 text-sm text-[#8B8182]">
          إنتي {mySymbol} — {myTurn ? 'دورك' : 'مستنيين الطرف التاني'}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {match.state.board.map((cell, index) => (
            <button
              key={index}
              onClick={() => myTurn && !cell && playCell(index)}
              className="soft-card flex h-20 items-center justify-center font-arDisplay text-3xl text-[#8E6873]"
              disabled={!myTurn || Boolean(cell)}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
