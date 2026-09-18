'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { GameShell } from '../GameShell';
import { displayCard } from '@/lib/games/basra';

interface Match {
  id: string;
  state: {
    table: string[];
    captured: Record<string, string[]>;
    handCounts: Record<string, number>;
    basraCounts: Record<string, number>;
    deckCount: number;
  };
  status: 'active' | 'finished';
  turn_user_id: string | null;
  winner_user_id: string | null;
}

export function BasraPage() {
  const [match, setMatch] = useState<Match | null>(null);
  const [myHand, setMyHand] = useState<string[]>([]);
  const [myId, setMyId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedTableCards, setSelectedTableCards] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  async function load() {
    const response = await fetch('/api/games/basra/match');
    const data = await response.json();
    setMatch(data.match);
    setMyHand(data.myHand ?? []);
    setMyId(data.myId);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!match?.id || !myId) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`basra-${match.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_matches', filter: `id=eq.${match.id}` },
        (payload) => setMatch(payload.new as Match),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_hands', filter: `match_id=eq.${match.id}` },
        (payload) => {
          const row = payload.new as { user_id: string; cards: string[] };
          if (row.user_id === myId) setMyHand(row.cards);
        },
      )
      .subscribe();
    const interval = setInterval(load, 2500);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [match?.id, myId]);

  async function startGame() {
    setStarting(true);
    setError(null);
    const response = await fetch('/api/games/basra/start', { method: 'POST' });
    const data = await response.json().catch(() => ({}));
    setStarting(false);
    if (response.ok) {
      setMatch(data.match);
      load();
    } else {
      setError(data.error ?? `خطأ (${response.status}) بلا تفاصيل — تأكد إن SUPABASE_SERVICE_ROLE_KEY متظبط في .env.local.`);
    }
  }

  function toggleTableCard(card: string) {
    setSelectedTableCards((current) => (current.includes(card) ? current.filter((item) => item !== card) : [...current, card]));
  }

  async function playCard() {
    if (!match || !selectedCard) return;
    setError(null);
    const response = await fetch('/api/games/basra/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId: match.id, card: selectedCard, selected: selectedTableCards }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? 'حصلت مشكلة.');
    } else {
      if (data.isBasra) {
        setFlash('بصرة! 🤍');
        setTimeout(() => setFlash(null), 2500);
      }
      setSelectedCard(null);
      setSelectedTableCards([]);
      load();
    }
  }

  if (!match || match.status === 'finished') {
    const finished = match?.status === 'finished';
    let resultLine: string | null = null;
    if (finished && match && myId) {
      resultLine = match.winner_user_id ? (match.winner_user_id === myId ? 'كسبتي! 🎉' : 'كسبت هي المرادي 🤍') : 'تعادل!';
    }
    return (
      <GameShell title="الباصرة">
        <div className="mx-auto max-w-sm text-center">
          {resultLine && <p className="mb-6 text-lg text-[#E3C567]">{resultLine}</p>}
          {error && <p className="mb-4 text-sm text-[#e08787]">{error}</p>}
          <button onClick={startGame} disabled={starting} className="game-btn">
            {starting ? '...' : finished ? 'لعبة تانية' : 'ابدأ اللعبة'}
          </button>
        </div>
      </GameShell>
    );
  }

  const myTurn = match.turn_user_id === myId;
  const otherId = Object.keys(match.state.handCounts).find((id) => id !== myId);

  return (
    <GameShell title="الباصرة">
      <div className="mx-auto max-w-2xl">
        <p className="mb-4 text-center text-sm text-white/60">
          {myTurn ? 'دورك' : 'مستنيين الطرف التاني'} · الديك: {match.state.deckCount} · ورق معاها: {otherId ? match.state.handCounts[otherId] : '—'}
        </p>

        {flash && <p className="mb-4 text-center text-lg text-[#E3C567]">{flash}</p>}
        {error && <p className="mb-4 text-center text-sm text-[#e08787]">{error}</p>}

        <p className="mb-2 text-sm text-white/50">الطاولة (دوسي تختاري ورق تاخديها)</p>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {match.state.table.length === 0 && <p className="text-sm text-white/40">فاضية</p>}
          {match.state.table.map((card) => (
            <button
              key={card}
              onClick={() => toggleTableCard(card)}
              className={`h-16 w-12 rounded-xl bg-white/90 text-sm text-[#241A2E] transition ${
                selectedTableCards.includes(card) ? 'ring-2 ring-[#E3C567]' : ''
              }`}
            >
              {displayCard(card)}
            </button>
          ))}
        </div>

        <p className="mb-2 text-sm text-white/50">ورقك</p>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {myHand.map((card) => (
            <button
              key={card}
              onClick={() => setSelectedCard(card)}
              disabled={!myTurn}
              className={`h-16 w-12 rounded-xl bg-white/90 text-sm text-[#241A2E] transition disabled:opacity-40 ${
                selectedCard === card ? 'ring-2 ring-[#E3C567]' : ''
              }`}
            >
              {displayCard(card)}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button onClick={playCard} disabled={!myTurn || !selectedCard} className="game-btn">
            العب الورقة
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-center text-xs text-white/50">
          <p>ورقي المكسوبة: {myId ? (match.state.captured[myId]?.length ?? 0) : 0} · بصرات: {myId ? (match.state.basraCounts[myId] ?? 0) : 0}</p>
          <p>ورقها المكسوبة: {otherId ? (match.state.captured[otherId]?.length ?? 0) : 0} · بصرات: {otherId ? (match.state.basraCounts[otherId] ?? 0) : 0}</p>
        </div>
      </div>
    </GameShell>
  );
}
