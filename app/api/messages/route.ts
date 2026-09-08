import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { otherPartner } from '@/lib/types';

// Returns messages addressed to me: unlocked ones (with a flag for
// "just unlocked, never seen" so the UI can show a clear notification),
// and a count of how many are still locked (no content revealed).
export async function GET() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  const now = new Date().toISOString();

  const { data: unlocked } = await supabase
    .from('locked_messages')
    .select('*')
    .eq('recipient', who)
    .lte('unlock_at', now)
    .order('unlock_at', { ascending: false });

  const { count: lockedCount } = await supabase
    .from('locked_messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient', who)
    .gt('unlock_at', now);

  const justUnlocked = (unlocked ?? []).filter((message) => !message.seen_unlocked_at);

  if (justUnlocked.length > 0) {
    await supabase
      .from('locked_messages')
      .update({ seen_unlocked_at: now })
      .in(
        'id',
        justUnlocked.map((message) => message.id),
      );
  }

  return NextResponse.json({
    unlocked: unlocked ?? [],
    justUnlockedIds: justUnlocked.map((message) => message.id),
    lockedCount: lockedCount ?? 0,
  });
}

export async function POST(request: NextRequest) {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const content: string | undefined = body?.content;
  const unlockAt: string | undefined = body?.unlockAt;

  if (!content?.trim() || !unlockAt) {
    return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('locked_messages').insert({
    written_by: who,
    recipient: otherPartner(who),
    content: content.trim(),
    unlock_at: unlockAt,
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
