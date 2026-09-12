import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data, error } = await supabase
    .from('shared_dreams')
    .select('*')
    .eq('space_id', user.spaceId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });
  return NextResponse.json({ dreams: data });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const supabase = getSupabaseUserClient();

  if (body?.markAchievedId) {
    const { error } = await supabase
      .from('shared_dreams')
      .update({ status: 'اتحقق', achieved_at: new Date().toISOString().slice(0, 10) })
      .eq('id', body.markAchievedId)
      .eq('space_id', user.spaceId);
    if (error) return NextResponse.json({ error: 'فشل التحديث.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const title: string | undefined = body?.title;
  if (!title?.trim()) return NextResponse.json({ error: 'اكتبي الحلم.' }, { status: 400 });

  const { error } = await supabase.from('shared_dreams').insert({
    space_id: user.spaceId,
    created_by: user.id,
    title: title.trim(),
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
