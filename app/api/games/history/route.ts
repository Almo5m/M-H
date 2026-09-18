import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data } = await supabase
    .from('game_matches')
    .select('id, game_key, winner_user_id, updated_at')
    .eq('space_id', user.spaceId)
    .eq('status', 'finished')
    .order('updated_at', { ascending: false });

  return NextResponse.json({ matches: data ?? [], myId: user.id });
}
