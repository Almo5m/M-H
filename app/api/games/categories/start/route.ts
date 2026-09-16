import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const letter: string | undefined = body?.letter;
  if (!letter) return NextResponse.json({ error: 'اختار حرف.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('game_matches')
    .insert({
      space_id: user.spaceId,
      game_key: 'categories',
      state: { letter, status: 'answering', answers: {}, scores: {}, doneBy: null },
      status: 'active',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'فشل بدء اللعبة.' }, { status: 500 });
  return NextResponse.json({ match: data });
}
