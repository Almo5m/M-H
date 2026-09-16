import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data: match } = await supabase
    .from('game_matches')
    .select('*')
    .eq('space_id', user.spaceId)
    .eq('game_key', 'basra')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let myHand: string[] = [];
  if (match) {
    const { data: handRow } = await supabase
      .from('game_hands')
      .select('cards')
      .eq('match_id', match.id)
      .eq('user_id', user.id)
      .maybeSingle();
    myHand = handRow?.cards ?? [];
  }

  return NextResponse.json({ match: match ?? null, myHand, myId: user.id });
}
