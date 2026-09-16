import { NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك في المساحة لسه.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { data: match, error } = await supabase
    .from('game_matches')
    .insert({
      space_id: user.spaceId,
      game_key: 'ludo',
      state: {
        colors: { [user.id]: 'red', [other.id]: 'yellow' },
        tokens: { [user.id]: [-1, -1, -1, -1], [other.id]: [-1, -1, -1, -1] },
        diceValue: null,
        phase: 'roll',
        consecutiveSixes: 0,
      },
      status: 'active',
      turn_user_id: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: 'فشل بدء اللعبة.' }, { status: 500 });
  return NextResponse.json({ match });
}
