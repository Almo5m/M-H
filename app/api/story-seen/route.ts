import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  await supabase.from('presence').update({ has_seen_story: true }).eq('who', who);

  return NextResponse.json({ ok: true });
}
