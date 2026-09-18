import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('game_matches')
    .insert({
      space_id: user.spaceId,
      game_key: 'categories',
      state: { letter: null, status: 'picking', answers: {}, scores: {}, doneBy: null },
      status: 'active',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'فشل بدء اللعبة.' }, { status: 500 });
  return NextResponse.json({ match: data });
}
