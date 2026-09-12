import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const now = new Date().toISOString();

  const { data: received } = await supabase
    .from('messages')
    .select('*')
    .eq('space_id', user.spaceId)
    .eq('recipient_id', user.id)
    .or(`delivery_mode.eq.now,and(delivery_mode.eq.scheduled,unlock_at.lte.${now})`)
    .order('created_at', { ascending: false });

  const { data: waiting } = await supabase
    .from('messages')
    .select('*')
    .eq('space_id', user.spaceId)
    .eq('recipient_id', user.id)
    .eq('delivery_mode', 'scheduled')
    .gt('unlock_at', now)
    .order('unlock_at', { ascending: true });

  const { data: written } = await supabase
    .from('messages')
    .select('*')
    .eq('space_id', user.spaceId)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  const justUnlocked = (received ?? []).filter((message) => !message.seen_unlocked_at);
  if (justUnlocked.length > 0) {
    await supabase
      .from('messages')
      .update({ seen_unlocked_at: now })
      .in('id', justUnlocked.map((message) => message.id));
  }

  return NextResponse.json({
    received: received ?? [],
    waiting: waiting ?? [],
    written: written ?? [],
    justUnlockedIds: justUnlocked.map((message) => message.id),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const content: string | undefined = body?.content;
  const deliveryMode: string | undefined = body?.deliveryMode;
  const unlockAt: string | undefined = body?.unlockAt;

  if (!content?.trim() || !deliveryMode) {
    return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });
  }
  if (deliveryMode === 'scheduled' && !unlockAt) {
    return NextResponse.json({ error: 'محتاجين الميعاد.' }, { status: 400 });
  }

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك في المساحة لسه.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { error } = await supabase.from('messages').insert({
    space_id: user.spaceId,
    created_by: user.id,
    recipient_id: other.id,
    content: content.trim(),
    delivery_mode: deliveryMode,
    unlock_at: deliveryMode === 'scheduled' ? unlockAt : null,
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
