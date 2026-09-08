import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { otherPartner } from '@/lib/types';

const ONLINE_WINDOW_MS = 45_000;

// Heartbeat: marks the caller as "here", and reports whether the other
// partner is currently on the site too (checked in the same trip).
export async function POST() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  const now = new Date();

  await supabase.from('presence').update({ last_seen_at: now.toISOString() }).eq('who', who);

  const { data } = await supabase
    .from('presence')
    .select('*')
    .eq('who', otherPartner(who))
    .maybeSingle();

  const otherOnline = data ? now.getTime() - new Date(data.last_seen_at).getTime() < ONLINE_WINDOW_MS : false;

  return NextResponse.json({ otherOnline });
}
