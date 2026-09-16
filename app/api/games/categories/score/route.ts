import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';
import { CATEGORY_ORDER } from '@/lib/games/categories';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const matchId: string | undefined = body?.matchId;
  const forUserId: string | undefined = body?.userId;
  const category: string | undefined = body?.category;
  const points: number | undefined = body?.points;

  if (!matchId || !forUserId || !category || points === undefined) {
    return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });
  }

  const supabase = getSupabaseUserClient();
  const { data: match } = await supabase.from('game_matches').select('*').eq('id', matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: 'مفيش لعبة زي كده.' }, { status: 404 });

  const scores = { ...match.state.scores };
  scores[forUserId] = { ...scores[forUserId], [category]: points };

  const newState = { ...match.state, scores };
  const update: Record<string, unknown> = { state: newState, updated_at: new Date().toISOString() };

  const other = await getOtherMember(user.spaceId, user.id);
  const playerIds = other ? [user.id, other.id] : [user.id];
  const allFilled = playerIds.every((id) =>
    CATEGORY_ORDER.every((category2) => scores[id]?.[category2.key] !== undefined),
  );

  if (allFilled) {
    const sums = playerIds.map((id) => ({
      id,
      total: CATEGORY_ORDER.reduce((sum, category2) => sum + (scores[id]?.[category2.key] ?? 0), 0),
    }));
    sums.sort((a, b) => b.total - a.total);
    update.status = 'finished';
    if (sums.length === 2 && sums[0].total !== sums[1].total) {
      update.winner_user_id = sums[0].id;
    }
  }

  const { error } = await supabase.from('game_matches').update(update).eq('id', matchId);
  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
