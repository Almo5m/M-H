import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const matchId: string | undefined = body?.matchId;
  const letter: string | undefined = body?.letter;
  if (!matchId || !letter) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { data: match } = await supabase.from('game_matches').select('*').eq('id', matchId).maybeSingle();
  if (!match || match.state.status !== 'picking') {
    return NextResponse.json({ error: 'مش ممكن تغيّر الحرف دلوقتي.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('game_matches')
    .update({ state: { ...match.state, letter }, updated_at: new Date().toISOString() })
    .eq('id', matchId);

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  const { data: updated } = await supabase.from('game_matches').select('*').eq('id', matchId).maybeSingle();
  return NextResponse.json({ ok: true, match: updated });
}
