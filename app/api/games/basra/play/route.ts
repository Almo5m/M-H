import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { isValidCapture } from '@/lib/games/basra';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const matchId: string | undefined = body?.matchId;
  const card: string | undefined = body?.card;
  const selected: string[] = body?.selected ?? [];

  if (!matchId || !card) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const admin = getSupabaseServerClient();
  const userClient = getSupabaseUserClient();

  const { data: match } = await userClient.from('game_matches').select('*').eq('id', matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: 'مفيش لعبة زي كده.' }, { status: 404 });
  if (match.status !== 'active') return NextResponse.json({ error: 'اللعبة خلصت.' }, { status: 400 });
  if (match.turn_user_id !== user.id) return NextResponse.json({ error: 'مش دورك.' }, { status: 400 });

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك.' }, { status: 400 });

  const { data: handRow } = await admin
    .from('game_hands')
    .select('cards')
    .eq('match_id', matchId)
    .eq('user_id', user.id)
    .maybeSingle();

  const myHand: string[] = handRow?.cards ?? [];
  if (!myHand.includes(card)) return NextResponse.json({ error: 'الورقة دي مش في إيدك.' }, { status: 400 });

  const table: string[] = match.state.table;
  if (!selected.every((selectedCard) => table.includes(selectedCard))) {
    return NextResponse.json({ error: 'الورق ده مش على الطاولة.' }, { status: 400 });
  }
  if (!isValidCapture(card, selected)) {
    return NextResponse.json({ error: 'الحركة دي مش صح.' }, { status: 400 });
  }

  const tableHadCards = table.length > 0;
  const newTable = selected.length > 0 ? table.filter((tableCard) => !selected.includes(tableCard)) : [...table, card];
  const captured = { ...match.state.captured };
  const isBasra = selected.length > 0 && newTable.length === 0 && tableHadCards;

  if (selected.length > 0) {
    captured[user.id] = [...(captured[user.id] ?? []), card, ...selected];
  }

  const newHand = myHand.filter((handCard) => handCard !== card);
  await admin.from('game_hands').update({ cards: newHand }).eq('match_id', matchId).eq('user_id', user.id);

  const handCounts = { ...match.state.handCounts, [user.id]: newHand.length };
  const basraCounts = { ...match.state.basraCounts };
  if (isBasra) basraCounts[user.id] = (basraCounts[user.id] ?? 0) + 1;
  const lastCaptureBy = selected.length > 0 ? user.id : match.state.lastCaptureBy;

  const bothHandsEmpty = handCounts[user.id] === 0 && handCounts[other.id] === 0;

  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (bothHandsEmpty) {
    const { data: deckRow } = await admin.from('game_decks').select('cards').eq('match_id', matchId).maybeSingle();
    const deck: string[] = deckRow?.cards ?? [];

    if (deck.length >= 8) {
      const dealMe = deck.splice(0, 4);
      const dealOther = deck.splice(0, 4);
      await admin.from('game_decks').update({ cards: deck }).eq('match_id', matchId);
      await admin.from('game_hands').update({ cards: dealMe }).eq('match_id', matchId).eq('user_id', user.id);
      await admin.from('game_hands').update({ cards: dealOther }).eq('match_id', matchId).eq('user_id', other.id);

      handCounts[user.id] = dealMe.length;
      handCounts[other.id] = dealOther.length;
      update.state = { ...match.state, table: newTable, captured, handCounts, basraCounts, deckCount: deck.length, lastCaptureBy };
      update.turn_user_id = other.id;
    } else {
      // Game over — remaining table cards go to whoever captured last.
      if (newTable.length > 0 && lastCaptureBy) {
        captured[lastCaptureBy] = [...(captured[lastCaptureBy] ?? []), ...newTable];
      }
      const scoreFor = (id: string) => (captured[id]?.length ?? 0) + 10 * (basraCounts[id] ?? 0);
      const myScore = scoreFor(user.id);
      const otherScore = scoreFor(other.id);

      update.state = {
        ...match.state,
        table: [],
        captured,
        handCounts,
        basraCounts,
        deckCount: 0,
        lastCaptureBy,
      };
      update.status = 'finished';
      if (myScore !== otherScore) update.winner_user_id = myScore > otherScore ? user.id : other.id;
    }
  } else {
    update.state = { ...match.state, table: newTable, captured, handCounts, basraCounts, lastCaptureBy };
    update.turn_user_id = other.id;
  }

  const { error } = await userClient.from('game_matches').update(update).eq('id', matchId);
  if (error) return NextResponse.json({ error: 'فشل تسجيل الحركة.' }, { status: 500 });

  return NextResponse.json({ ok: true, isBasra });
}
