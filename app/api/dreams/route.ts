import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('shared_dreams')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });
  return NextResponse.json({ dreams: data });
}

export async function POST(request: NextRequest) {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const content: string | undefined = body?.content;
  const dreamId: string | undefined = body?.markAchievedId;

  const supabase = getSupabaseServerClient();

  if (dreamId) {
    const { error } = await supabase
      .from('shared_dreams')
      .update({ achieved: true, achieved_at: new Date().toISOString() })
      .eq('id', dreamId);
    if (error) return NextResponse.json({ error: 'فشل التحديث.' }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (!content?.trim()) return NextResponse.json({ error: 'اكتبي الحلم.' }, { status: 400 });

  const { error } = await supabase.from('shared_dreams').insert({ added_by: who, content: content.trim() });
  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
