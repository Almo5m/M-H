import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('honesty_notes')
    .select('*')
    .eq('space_id', user.spaceId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });
  return NextResponse.json({ notes: data, myId: user.id });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const content: string | undefined = body?.content;
  const moodTag: string | undefined = body?.moodTag;

  if (!content?.trim()) return NextResponse.json({ error: 'اكتب حاجة الأول.' }, { status: 400 });

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك في المساحة لسه.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { error } = await supabase.from('honesty_notes').insert({
    space_id: user.spaceId,
    created_by: user.id,
    recipient_id: other.id,
    content: content.trim(),
    mood_tag: moodTag || null,
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Mark-as-read / add-reply
export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id: string | undefined = body?.id;
  const action: string | undefined = body?.action; // 'read' | 'reply'
  const replyType: string | undefined = body?.replyType;

  if (!id || !action) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const update =
    action === 'read'
      ? { read_at: new Date().toISOString() }
      : { reply_type: replyType, replied_at: new Date().toISOString() };

  const { error } = await supabase.from('honesty_notes').update(update).eq('id', id).eq('space_id', user.spaceId);
  if (error) return NextResponse.json({ error: 'فشل التحديث.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
