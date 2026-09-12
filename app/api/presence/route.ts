import { NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

const ONLINE_WINDOW_MS = 45_000;

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const now = new Date();

  await supabase.from('presence').upsert({
    user_id: user.id,
    space_id: user.spaceId,
    last_seen_at: now.toISOString(),
  });

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ otherOnline: false, otherName: null, otherLastSeenAt: null });

  const { data } = await supabase.from('presence').select('last_seen_at').eq('user_id', other.id).maybeSingle();

  const otherOnline = data ? now.getTime() - new Date(data.last_seen_at).getTime() < ONLINE_WINDOW_MS : false;

  return NextResponse.json({ otherOnline, otherName: other.displayName, otherLastSeenAt: data?.last_seen_at ?? null });
}
