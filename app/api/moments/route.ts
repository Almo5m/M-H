import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('moments')
    .select('*, profiles(display_name)')
    .eq('space_id', user.spaceId)
    .order('occurred_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });

  const withUrls = (data ?? []).map((moment: any) => ({
    ...moment,
    photo_url: moment.photo_storage_path
      ? supabase.storage.from('photos').getPublicUrl(moment.photo_storage_path).data.publicUrl
      : null,
    author_name: moment.profiles?.display_name ?? null,
  }));

  return NextResponse.json({ moments: withUrls });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const formData = await request.formData();
  const content = formData.get('content');
  const occurredAt = formData.get('occurredAt');
  const photo = formData.get('photo');

  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'اكتبها الأول.' }, { status: 400 });
  }

  const supabase = getSupabaseUserClient();
  let photoPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const extension = photo.name.split('.').pop() ?? 'jpg';
    photoPath = `${user.spaceId}/moment-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(photoPath, photo, { contentType: photo.type });
    if (uploadError) return NextResponse.json({ error: 'فشل رفع الصورة.' }, { status: 500 });
  }

  const { error } = await supabase.from('moments').insert({
    space_id: user.spaceId,
    created_by: user.id,
    content: content.trim(),
    photo_storage_path: photoPath,
    occurred_at: typeof occurredAt === 'string' && occurredAt ? occurredAt : new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
