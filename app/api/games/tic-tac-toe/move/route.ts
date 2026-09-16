import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: (string | null)[]): string | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const matchId: string | undefined = body?.matchId;
  const cellIndex: number | undefined = body?.cellIndex;

  if (!matchId || cellIndex === undefined) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { data: match } = await supabase.from('game_matches').select('*').eq('id', matchId).maybeSingle();

  if (!match) return NextResponse.json({ error: 'مفيش لعبة زي كده.' }, { status: 404 });
  if (match.status !== 'active') return NextResponse.json({ error: 'اللعبة خلصت.' }, { status: 400 });
  if (match.turn_user_id !== user.id) return NextResponse.json({ error: 'مش دورك.' }, { status: 400 });

  const board: (string | null)[] = match.state.board;
  if (board[cellIndex]) return NextResponse.json({ error: 'الخانة دي متاخدة.' }, { status: 400 });

  const mySymbol = match.state.symbols[user.id];
  board[cellIndex] = mySymbol;

  const winnerSymbol = checkWinner(board);
  const isDraw = !winnerSymbol && board.every((cell) => cell !== null);
  const otherUserId = Object.keys(match.state.symbols).find((id) => id !== user.id);

  const update: Record<string, unknown> = {
    state: { ...match.state, board },
    updated_at: new Date().toISOString(),
  };

  if (winnerSymbol) {
    update.status = 'finished';
    update.winner_user_id = user.id;
  } else if (isDraw) {
    update.status = 'finished';
  } else {
    update.turn_user_id = otherUserId;
  }

  const { error } = await supabase.from('game_matches').update(update).eq('id', matchId);
  if (error) return NextResponse.json({ error: 'فشل تسجيل الحركة.' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
