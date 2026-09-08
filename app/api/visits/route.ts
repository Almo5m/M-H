import { NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// Logs a visit for the caller and returns the combined visit count for
// both partners — this is what drives the rotating surprise variants.
export async function POST() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  await supabase.from('visit_log').insert({ who });

  const { count } = await supabase.from('visit_log').select('*', { count: 'exact', head: true });

  return NextResponse.json({ visitCount: count ?? 0 });
}
