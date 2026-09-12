import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { error } = await supabase.from('remembered_dates').delete().eq('id', params.id).eq('space_id', user.spaceId);

  if (error) return NextResponse.json({ error: 'فشل الحذف.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
