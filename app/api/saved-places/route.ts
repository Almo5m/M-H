import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('saved_places')
    .select('*')
    .eq('space_id', user.spaceId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });

  const withUrls = (data ?? []).map((place) => ({
    ...place,
    photo_url: place.photo_storage_path
      ? supabase.storage.from('photos').getPublicUrl(place.photo_storage_path).data.publicUrl
      : null,
  }));

  return NextResponse.json({ places: withUrls });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const formData = await request.formData();
  const title = formData.get('title');
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const description = formData.get('description');
  const visited = formData.get('visited');
  const photo = formData.get('photo');

  if (typeof title !== 'string' || !title.trim() || !latitude || !longitude) {
    return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });
  }

  const supabase = getSupabaseUserClient();
  let photoPath: string | null = null;

  if (photo instanceof File && photo.size > 0) {
    const extension = photo.name.split('.').pop() ?? 'jpg';
    photoPath = `${user.spaceId}/place-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('photos').upload(photoPath, photo, { contentType: photo.type });
    if (uploadError) return NextResponse.json({ error: 'فشل رفع الصورة.' }, { status: 500 });
  }

  const { error } = await supabase.from('saved_places').insert({
    space_id: user.spaceId,
    created_by: user.id,
    title: title.trim(),
    latitude: Number(latitude),
    longitude: Number(longitude),
    description: typeof description === 'string' && description.trim() ? description.trim() : null,
    photo_storage_path: photoPath,
    visited: visited === 'true',
    visited_at: visited === 'true' ? new Date().toISOString().slice(0, 10) : null,
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
