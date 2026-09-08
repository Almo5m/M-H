import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('playlist_songs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });

  const withUrls = (data ?? []).map((song) => ({
    ...song,
    url: supabase.storage.from('songs').getPublicUrl(song.storage_path).data.publicUrl,
  }));

  return NextResponse.json({ songs: withUrls });
}

export async function POST(request: NextRequest) {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('song');
  const title = formData.get('title');

  if (!(file instanceof File) || file.size === 0 || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'محتاجين اسم الأغنية والملف.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const path = `${who}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('songs')
    .upload(path, file, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: 'فشل رفع الأغنية.' }, { status: 500 });

  const { error: insertError } = await supabase.from('playlist_songs').insert({
    uploaded_by: who,
    title: title.trim(),
    storage_path: path,
  });

  if (insertError) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
