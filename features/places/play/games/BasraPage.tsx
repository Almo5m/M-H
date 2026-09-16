'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browserClient';
import { BackToHub } from '@/features/hub/BackToHub';
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
    return () => {
      supabase.removeChannel(channel);
    };
  }, [match?.id, myId]);

  async function startGame() {
    const response = await fetch('/api/games/basra/start', { method: 'POST' });
    const data = await response.json();
    if (response.ok) {
      setMatch(data.match);
      load();
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
      <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
        <BackToHub />
        <div className="mx-auto max-w-sm text-center">
          <p className="font-arDisplay text-3xl text-[#40383A]">الباصرة</p>
          {resultLine && <p className="my-4 text-[#8E6873]">{resultLine}</p>}
          <button onClick={startGame} className="btn-primary mt-6">
            {finished ? 'لعبة تانية' : 'ابدأ اللعبة'}
          </button>
        </div>
      </main>
    );
  }

  const myTurn = match.turn_user_id === myId;
  const otherId = Object.keys(match.state.handCounts).find((id) => id !== myId);

  return (
    <main className="page-fade-in min-h-screen bg-[#F7F1E8] px-6 py-16">
      <BackToHub />
      <div className="mx-auto max-w-2xl">
        <p className="text-center font-arDisplay text-3xl text-[#40383A]">الباصرة</p>
        <p className="mb-4 text-center text-sm text-[#8B8182]">
          {myTurn ? 'دورك' : 'مستنيين الطرف التاني'} · الديك: {match.state.deckCount} · ورق معاها: {otherId ? match.state.handCounts[otherId] : '—'}
        </p>

        {flash && <p className="mb-4 text-center text-lg text-[#C7A96B]">{flash}</p>}
        {error && <p className="mb-4 text-center text-sm text-[#8E6873]">{error}</p>}

        <p className="mb-2 text-sm text-[#8B8182]">الطاولة (دوسي تختاري ورق تاخديها)</p>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {match.state.table.length === 0 && <p className="text-sm text-[#8B8182]">فاضية</p>}
          {match.state.table.map((card) => (
            <button
              key={card}
              onClick={() => toggleTableCard(card)}
              className={`soft-card h-16 w-12 text-sm ${selectedTableCards.includes(card) ? 'ring-2 ring-[#C7A96B]' : ''}`}
            >
              {displayCard(card)}
            </button>
          ))}
        </div>

        <p className="mb-2 text-sm text-[#8B8182]">ورقك</p>
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {myHand.map((card) => (
            <button
              key={card}
              onClick={() => setSelectedCard(card)}
              disabled={!myTurn}
              className={`soft-card h-16 w-12 text-sm disabled:opacity-40 ${selectedCard === card ? 'ring-2 ring-[#8E6873]' : ''}`}
            >
              {displayCard(card)}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button onClick={playCard} disabled={!myTurn || !selectedCard} className="btn-primary">
            العب الورقة
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 text-center text-xs text-[#8B8182]">
          <p>ورقي المكسوبة: {myId ? (match.state.captured[myId]?.length ?? 0) : 0} · بصرات: {myId ? (match.state.basraCounts[myId] ?? 0) : 0}</p>
          <p>ورقها المكسوبة: {otherId ? (match.state.captured[otherId]?.length ?? 0) : 0} · بصرات: {otherId ? (match.state.basraCounts[otherId] ?? 0) : 0}</p>
        </div>
      </div>
    </main>
  );
}
