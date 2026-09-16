import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';
import { rollDie } from '@/lib/games/ludo';

function legalMoves(tokens: number[], diceValue: number): number[] {
  const indices: number[] = [];
  tokens.forEach((step, index) => {
    if (step === -1) {
      if (diceValue === 6) indices.push(index);
      return;
    }
    if (step + diceValue <= 57) indices.push(index);
  });
  return indices;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const matchId: string | undefined = body?.matchId;
  if (!matchId) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { data: match } = await supabase.from('game_matches').select('*').eq('id', matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: 'مفيش لعبة زي كده.' }, { status: 404 });
  if (match.status !== 'active') return NextResponse.json({ error: 'اللعبة خلصت.' }, { status: 400 });
  if (match.turn_user_id !== user.id) return NextResponse.json({ error: 'مش دورك.' }, { status: 400 });
  if (match.state.phase !== 'roll') return NextResponse.json({ error: 'لازم تلعبي النرد اللي فات الأول.' }, { status: 400 });

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك.' }, { status: 400 });

  const diceValue = rollDie();
  const myTokens: number[] = match.state.tokens[user.id];
  const movable = legalMoves(myTokens, diceValue);

  let consecutiveSixes = diceValue === 6 ? (match.state.consecutiveSixes ?? 0) + 1 : 0;
  const forfeitForThreeSixes = consecutiveSixes >= 3;

  if (movable.length === 0 || forfeitForThreeSixes) {
    // No legal move (or three sixes in a row forfeits the turn) — pass.
    const update = {
      state: { ...match.state, diceValue: null, phase: 'roll', consecutiveSixes: 0 },
      turn_user_id: other.id,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('game_matches').update(update).eq('id', matchId);
    return NextResponse.json({ diceValue, passed: true, forfeitForThreeSixes });
  }

  const update = {
    state: { ...match.state, diceValue, phase: 'move', consecutiveSixes },
    updated_at: new Date().toISOString(),
  };
  await supabase.from('game_matches').update(update).eq('id', matchId);

  return NextResponse.json({ diceValue, passed: false, movable });
}
