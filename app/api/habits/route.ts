import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

function appliesOnDate(habit: any, dateStr: string): boolean {
  if (habit.recurrence_type === 'daily') return true;
  if (habit.recurrence_type === 'once') return habit.once_date === dateStr;
  if (habit.recurrence_type === 'weekly_days') {
    const dayIndex = new Date(dateStr + 'T12:00:00').getDay(); // 0=Sun..6=Sat
    return Array.isArray(habit.recurrence_days) && habit.recurrence_days.includes(dayIndex);
  }
  return false;
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const dateStr = request.nextUrl.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);

  const supabase = getSupabaseUserClient();
  const { data: habits, error } = await supabase
    .from('habits')
    .select('*')
    .eq('space_id', user.spaceId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: 'فشل التحميل.' }, { status: 500 });

  const todaysHabits = (habits ?? []).filter((habit) => appliesOnDate(habit, dateStr));
  const habitIds = todaysHabits.map((habit) => habit.id);

  const { data: logs } = habitIds.length
    ? await supabase.from('habit_logs').select('*').in('habit_id', habitIds).eq('log_date', dateStr)
    : { data: [] };

  const other = await getOtherMember(user.spaceId, user.id);

  return NextResponse.json({
    date: dateStr,
    habits: todaysHabits,
    logs: logs ?? [],
    me: { id: user.id, displayName: user.displayName },
    other: other ?? null,
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title: string | undefined = body?.title;
  const assignedTo: string | undefined = body?.assignedTo; // 'me' | 'other' | 'both'
  const recurrenceType: string | undefined = body?.recurrenceType; // 'daily' | 'weekly_days' | 'once'
  const recurrenceDays: number[] | undefined = body?.recurrenceDays;
  const onceDate: string | undefined = body?.onceDate;

  if (!title?.trim() || !recurrenceType) {
    return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });
  }

  let assignedToId: string | null = null;
  if (assignedTo === 'me') assignedToId = user.id;
  if (assignedTo === 'other') {
    const other = await getOtherMember(user.spaceId, user.id);
    assignedToId = other?.id ?? null;
  }

  const supabase = getSupabaseUserClient();
  const { error } = await supabase.from('habits').insert({
    space_id: user.spaceId,
    created_by: user.id,
    assigned_to: assignedToId,
    title: title.trim(),
    recurrence_type: recurrenceType,
    recurrence_days: recurrenceType === 'weekly_days' ? recurrenceDays ?? [] : null,
    once_date: recurrenceType === 'once' ? onceDate : null,
  });

  if (error) return NextResponse.json({ error: 'فشل الحفظ.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
