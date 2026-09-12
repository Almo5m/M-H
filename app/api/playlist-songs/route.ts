import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('playlist_songs')
    .select('*')
    .eq('space_id', user.spaceId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });

  const withUrls = (data ?? []).map((song) => ({
    ...song,
    url: supabase.storage.from('songs').getPublicUrl(song.storage_path).data.publicUrl,
  }));

  return NextResponse.json({ songs: withUrls });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('song');
  const title = formData.get('title');
  const artist = formData.get('artist');

  if (!(file instanceof File) || file.size === 0 || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json({ error: 'محتاجين اسم الأغنية والملف.' }, { status: 400 });
  }

  const supabase = getSupabaseUserClient();
  const path = `${user.spaceId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage.from('songs').upload(path, file, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: 'فشل رفع الأغنية.' }, { status: 500 });

  const { error: insertError } = await supabase.from('playlist_songs').insert({
    space_id: user.spaceId,
    created_by: user.id,
    title: title.trim(),
    artist: typeof artist === 'string' && artist.trim() ? artist.trim() : null,
    storage_path: path,
  });

  if (insertError) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
