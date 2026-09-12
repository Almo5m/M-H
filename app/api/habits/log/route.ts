import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

// Cycles a habit's status for the current user on a given date:
// لسه (no row) → اتعملت → اتأجلت → لسه (delete row) → ...
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const habitId: string | undefined = body?.habitId;
  const date: string | undefined = body?.date;
  const status: string | undefined = body?.status; // 'اتعملت' | 'اتأجلت' | null (clear)

  if (!habitId || !date) return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });

  const supabase = getSupabaseUserClient();

  if (!status) {
    await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('user_id', user.id).eq('log_date', date);
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabase.from('habit_logs').upsert(
    {
      habit_id: habitId,
      space_id: user.spaceId,
      user_id: user.id,
      log_date: date,
      status,
    },
    { onConflict: 'habit_id,user_id,log_date' },
  );

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
