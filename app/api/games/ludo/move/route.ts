import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';
import { coordFor, isSafeStep, type LudoColor } from '@/lib/games/ludo';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const matchId: string | undefined = body?.matchId;
  const tokenIndex: number | undefined = body?.tokenIndex;
  if (!matchId || tokenIndex === undefined) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { data: match } = await supabase.from('game_matches').select('*').eq('id', matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: 'مفيش لعبة زي كده.' }, { status: 404 });
  if (match.turn_user_id !== user.id) return NextResponse.json({ error: 'مش دورك.' }, { status: 400 });
  if (match.state.phase !== 'move' || match.state.diceValue === null) {
    return NextResponse.json({ error: 'دوري النرد الأول.' }, { status: 400 });
  }

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك.' }, { status: 400 });

  const diceValue: number = match.state.diceValue;
  const myColor: LudoColor = match.state.colors[user.id];
  const otherColor: LudoColor = match.state.colors[other.id];
  const myTokens: number[] = [...match.state.tokens[user.id]];
  const otherTokens: number[] = [...match.state.tokens[other.id]];

  const currentStep = myTokens[tokenIndex];
  let newStep: number;
  if (currentStep === -1) {
    if (diceValue !== 6) return NextResponse.json({ error: 'محتاجة ٦ عشان تخرجي عسكري.' }, { status: 400 });
    newStep = 0;
  } else {
    newStep = currentStep + diceValue;
    if (newStep > 57) return NextResponse.json({ error: 'الحركة دي هتعدي الآخر.' }, { status: 400 });
  }

  myTokens[tokenIndex] = newStep;

  // Capture check — only on the shared ring (not yard/home-stretch/center).
  let captured = false;
  if (newStep >= 0 && newStep <= 50 && !isSafeStep(myColor, newStep)) {
    const myCoord = coordFor(myColor, newStep);
    otherTokens.forEach((step, index) => {
      if (step < 0 || step > 50) return;
      const theirCoord = coordFor(otherColor, step);
      if (theirCoord.row === myCoord.row && theirCoord.col === myCoord.col) {
        otherTokens[index] = -1;
        captured = true;
      }
    });
  }

  const iWon = myTokens.every((step) => step === 57);
  const getsAnotherTurn = diceValue === 6 && !iWon;

  const update: Record<string, unknown> = {
    state: {
      ...match.state,
      tokens: { ...match.state.tokens, [user.id]: myTokens, [other.id]: otherTokens },
      diceValue: null,
      phase: 'roll',
      consecutiveSixes: getsAnotherTurn ? match.state.consecutiveSixes : 0,
    },
    updated_at: new Date().toISOString(),
  };

  if (iWon) {
    update.status = 'finished';
    update.winner_user_id = user.id;
  } else if (!getsAnotherTurn) {
    update.turn_user_id = other.id;
  }

  const { error } = await supabase.from('game_matches').update(update).eq('id', matchId);
  if (error) return NextResponse.json({ error: 'فشل تسجيل الحركة.' }, { status: 500 });

  return NextResponse.json({ ok: true, captured, iWon });
}
