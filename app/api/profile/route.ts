import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const displayName: string | undefined = body?.displayName;
  const messageToPartner: string | undefined = body?.messageToPartner;

  const supabase = getSupabaseUserClient();
  const update: Record<string, string> = {};
  if (displayName?.trim()) update.display_name = displayName.trim();
  if (messageToPartner?.trim()) update.message_to_partner = messageToPartner.trim();

  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'مفيش حاجة اتغيرت.' }, { status: 400 });

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id);

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
