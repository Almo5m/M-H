import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const displayName: string | undefined = body?.displayName;
  if (!displayName?.trim()) return NextResponse.json({ error: 'اكتب اسم.' }, { status: 400 });

  const supabase = getSupabaseUserClient();
  const { error } = await supabase.from('profiles').update({ display_name: displayName.trim() }).eq('id', user.id);

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
