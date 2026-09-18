'use client';

import { useEffect, useState } from 'react';
import { GameShell } from './GameShell';

const GAME_NAMES: Record<string, string> = {
  tic_tac_toe: 'X O',
  categories: 'أتوبيس كومبليت',
  basra: 'الباصرة',
  ludo: 'ليدو',
};

interface HistoryRow {
  id: string;
  game_key: string;
  winner_user_id: string | null;
  updated_at: string;
}

export function HistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/games/history')
      .then((response) => response.json())
      .then((data) => {
        setRows(data.matches ?? []);
        setMyId(data.myId ?? null);
      });
  }, []);

  return (
    <GameShell title="سجل النتايج">
      <div className="mx-auto max-w-md">
        {rows.length === 0 ? (
          <p className="text-center text-sm text-white/50">لسه مفيش نتايج.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-3 text-sm">
                <span className="text-white">{GAME_NAMES[row.game_key] ?? row.game_key}</span>
                <span className="text-white/50">
                  {row.winner_user_id ? (row.winner_user_id === myId ? 'كسبتي' : 'كسبت هي') : 'تعادل'}
                </span>
                <span className="text-xs text-white/30">{new Date(row.updated_at).toLocaleDateString('ar-EG')}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GameShell>
  );
}
