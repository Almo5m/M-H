import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('archive_entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });

  const withUrls = (data ?? []).map((entry) => ({
    ...entry,
    photo_url: entry.photo_path
      ? supabase.storage.from('photos').getPublicUrl(entry.photo_path).data.publicUrl
      : null,
  }));

  return NextResponse.json({ entries: withUrls });
}

// Accepts multipart/form-data: content (text, required), photo (file, optional).
export async function POST(request: NextRequest) {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const formData = await request.formData();
  const content = formData.get('content');
  const photo = formData.get('photo');

  if (typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: 'اكتب حاجة الأول.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  let photoPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const extension = photo.name.split('.').pop() ?? 'jpg';
    const path = `${who}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(path, photo, { contentType: photo.type });

    if (uploadError) {
      return NextResponse.json({ error: 'فشل رفع الصورة.' }, { status: 500 });
    }
    photoPath = path;
  }

  const { error: insertError } = await supabase
    .from('archive_entries')
    .insert({ author: who, content: content.trim(), photo_path: photoPath });

  if (insertError) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
