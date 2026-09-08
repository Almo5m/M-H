import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('memory_photos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });

  const withUrls = (data ?? []).map((photo) => ({
    ...photo,
    url: supabase.storage.from('photos').getPublicUrl(photo.storage_path).data.publicUrl,
  }));

  return NextResponse.json({ photos: withUrls });
}

export async function POST(request: NextRequest) {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('photo');
  const caption = formData.get('caption');

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'اختاري صورة.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const extension = file.name.split('.').pop() ?? 'jpg';
  const path = `${who}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(path, file, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: 'فشل رفع الصورة.' }, { status: 500 });

  const { error: insertError } = await supabase.from('memory_photos').insert({
    uploaded_by: who,
    storage_path: path,
    caption: typeof caption === 'string' && caption.trim() ? caption.trim() : null,
  });

  if (insertError) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
