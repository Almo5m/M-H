import { NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك في المساحة لسه.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const state = {
    board: Array(9).fill(null),
    symbols: { [user.id]: 'X', [other.id]: 'O' },
  };

  const { data, error } = await supabase
    .from('game_matches')
    .insert({
      space_id: user.spaceId,
      game_key: 'tic_tac_toe',
      state,
      status: 'active',
      turn_user_id: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'فشل بدء اللعبة.' }, { status: 500 });
  return NextResponse.json({ match: data });
}
