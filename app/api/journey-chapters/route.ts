import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('journey_chapters')
    .select('*')
    .eq('space_id', user.spaceId)
    .order('chapter_date', { ascending: true });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });

  const withUrls = (data ?? []).map((chapter) => ({
    ...chapter,
    photo_url: chapter.photo_storage_path
      ? supabase.storage.from('photos').getPublicUrl(chapter.photo_storage_path).data.publicUrl
      : null,
  }));

  return NextResponse.json({ chapters: withUrls });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const formData = await request.formData();
  const chapterDate = formData.get('chapterDate');
  const title = formData.get('title');
  const description = formData.get('description');
  const photo = formData.get('photo');

  if (typeof chapterDate !== 'string' || !chapterDate || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });
  }

  const supabase = getSupabaseUserClient();
  let photoPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const extension = photo.name.split('.').pop() ?? 'jpg';
    photoPath = `${user.spaceId}/journey-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(photoPath, photo, { contentType: photo.type });
    if (uploadError) return NextResponse.json({ error: 'فشل رفع الصورة.' }, { status: 500 });
  }

  const { error } = await supabase.from('journey_chapters').insert({
    space_id: user.spaceId,
    created_by: user.id,
    chapter_date: chapterDate,
    title: title.trim(),
    description: typeof description === 'string' && description.trim() ? description.trim() : null,
    photo_storage_path: photoPath,
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
