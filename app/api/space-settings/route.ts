import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseUserClient();
  const { data } = await supabase.from('spaces').select('relationship_start_date').eq('id', user.spaceId).maybeSingle();

  const { data: myProfile } = await supabase.from('profiles').select('message_to_partner').eq('id', user.id).maybeSingle();

  const other = await getOtherMember(user.spaceId, user.id);
  let partnerMessageToMe: string | null = null;
  if (other) {
    const { data: otherProfile } = await supabase.from('profiles').select('message_to_partner').eq('id', other.id).maybeSingle();
    partnerMessageToMe = otherProfile?.message_to_partner ?? null;
  }

  return NextResponse.json({
    relationshipStartDate: data?.relationship_start_date ?? null,
    myMessageToPartner: myProfile?.message_to_partner ?? 'بحبك',
    partnerMessageToMe,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const relationshipStartDate: string | undefined = body?.relationshipStartDate;

  const supabase = getSupabaseUserClient();
  const { error } = await supabase
    .from('spaces')
    .update({ relationship_start_date: relationshipStartDate || null })
    .eq('id', user.spaceId);

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
