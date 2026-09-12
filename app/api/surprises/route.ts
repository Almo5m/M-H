import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const now = new Date().toISOString();

  const { data: ready } = await supabase
    .from('surprises')
    .select('*')
    .eq('space_id', user.spaceId)
    .eq('recipient_id', user.id)
    .lte('reveal_at', now)
    .order('reveal_at', { ascending: false });

  const { count: waitingCount } = await supabase
    .from('surprises')
    .select('*', { count: 'exact', head: true })
    .eq('space_id', user.spaceId)
    .eq('recipient_id', user.id)
    .gt('reveal_at', now);

  const { data: waitingNearest } = await supabase
    .from('surprises')
    .select('reveal_at')
    .eq('space_id', user.spaceId)
    .eq('recipient_id', user.id)
    .gt('reveal_at', now)
    .order('reveal_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: mine } = await supabase
    .from('surprises')
    .select('*')
    .eq('space_id', user.spaceId)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });

  const withUrls = (rows: any[]) =>
    (rows ?? []).map((row) => ({
      ...row,
      photo_url: row.photo_storage_path
        ? supabase.storage.from('photos').getPublicUrl(row.photo_storage_path).data.publicUrl
        : null,
    }));

  const readyWithUrls = withUrls(ready ?? []);
  const justRevealed = readyWithUrls.filter((row) => !row.revealed_at);
  if (justRevealed.length > 0) {
    await supabase.from('surprises').update({ revealed_at: now }).in('id', justRevealed.map((row) => row.id));
  }

  return NextResponse.json({
    ready: readyWithUrls,
    waitingCount: waitingCount ?? 0,
    nearestWaitingAt: waitingNearest?.reveal_at ?? null,
    mine: withUrls(mine ?? []),
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const formData = await request.formData();
  const contentType = formData.get('contentType');
  const textContent = formData.get('textContent');
  const photo = formData.get('photo');
  const revealAt = formData.get('revealAt');

  if (typeof revealAt !== 'string' || !revealAt || (contentType !== 'text' && contentType !== 'photo')) {
    return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });
  }

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك في المساحة لسه.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  let photoPath: string | null = null;

  if (contentType === 'photo') {
    if (!(photo instanceof File) || photo.size === 0) {
      return NextResponse.json({ error: 'اختار صورة.' }, { status: 400 });
    }
    const extension = photo.name.split('.').pop() ?? 'jpg';
    photoPath = `${user.spaceId}/surprise-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(photoPath, photo, { contentType: photo.type });
    if (uploadError) return NextResponse.json({ error: 'فشل رفع الصورة.' }, { status: 500 });
  }

  const { error } = await supabase.from('surprises').insert({
    space_id: user.spaceId,
    created_by: user.id,
    recipient_id: other.id,
    content_type: contentType,
    text_content: typeof textContent === 'string' && textContent.trim() ? textContent.trim() : null,
    photo_storage_path: photoPath,
    reveal_at: new Date(revealAt).toISOString(),
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
