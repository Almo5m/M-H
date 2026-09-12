import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('remembered_dates')
    .select('*')
    .eq('space_id', user.spaceId)
    .order('event_date', { ascending: true });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });
  return NextResponse.json({ dates: data });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title: string | undefined = body?.title;
  const eventDate: string | undefined = body?.eventDate;
  const recursYearly: boolean = Boolean(body?.recursYearly);
  const description: string | undefined = body?.description;

  if (!title?.trim() || !eventDate) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { error } = await supabase.from('remembered_dates').insert({
    space_id: user.spaceId,
    created_by: user.id,
    title: title.trim(),
    event_date: eventDate,
    recurs_yearly: recursYearly,
    description: description?.trim() || null,
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
