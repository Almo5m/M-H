import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const matchId: string | undefined = body?.matchId;
  const answers = body?.answers;
  const finishing: boolean = Boolean(body?.finishing);

  if (!matchId || !answers) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { data: match } = await supabase.from('game_matches').select('*').eq('id', matchId).maybeSingle();
  if (!match) return NextResponse.json({ error: 'مفيش لعبة زي كده.' }, { status: 404 });

  const newState = { ...match.state, answers: { ...match.state.answers, [user.id]: answers } };

  if (finishing && match.state.status === 'answering') {
    newState.status = 'scoring';
    newState.doneBy = user.id;
  }

  const { error } = await supabase
    .from('game_matches')
    .update({ state: newState, updated_at: new Date().toISOString() })
    .eq('id', matchId);

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
