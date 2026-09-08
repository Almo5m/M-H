import { NextRequest, NextResponse } from 'next/server';
import { readSession } from '@/lib/session';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { otherPartner } from '@/lib/types';

// Returns the current pending question addressed to the logged-in partner,
// and the most recent answered exchange (so the asker can see the reply).
export async function GET() {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const supabase = getSupabaseServerClient();

  const { data: pending } = await supabase
    .from('question_exchange')
    .select('*')
    .is('answer_text', null)
    .neq('asked_by', who)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: lastAnswered } = await supabase
    .from('question_exchange')
    .select('*')
    .eq('asked_by', who)
    .not('answer_text', 'is', null)
    .order('answered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ pendingForMe: pending ?? null, lastAnswerToMe: lastAnswered ?? null });
}

// Answers the pending question and asks a new one for the other partner.
export async function POST(request: NextRequest) {
  const who = readSession();
  if (!who) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const questionId: string | undefined = body?.questionId;
  const answerText: string | undefined = body?.answerText;
  const nextQuestionText: string | undefined = body?.nextQuestionText;

  if (!questionId || !answerText?.trim() || !nextQuestionText?.trim()) {
    return NextResponse.json({ error: 'ناقص بيانات.' }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  const { error: answerError } = await supabase
    .from('question_exchange')
    .update({ answer_text: answerText.trim(), answered_at: new Date().toISOString() })
    .eq('id', questionId)
    .eq('asked_by', otherPartner(who));

  if (answerError) {
    return NextResponse.json({ error: 'حصلت مشكلة في حفظ الرد.' }, { status: 500 });
  }

  const { error: nextError } = await supabase
    .from('question_exchange')
    .insert({ asked_by: who, question_text: nextQuestionText.trim() });

  if (nextError) {
    return NextResponse.json({ error: 'اتحفظ الرد بس مش السؤال الجديد.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
