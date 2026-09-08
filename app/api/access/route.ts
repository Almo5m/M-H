import { NextRequest, NextResponse } from 'next/server';
import { writeSessionCookie } from '@/lib/session';
import type { Partner } from '@/lib/types';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password: string | undefined = body?.password;
  const who: Partner | undefined = body?.who;

  if (!password || (who !== 'moaz' && who !== 'hanona')) {
    return NextResponse.json({ error: 'بيانات ناقصة.' }, { status: 400 });
  }

  if (password !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: 'الباسورد غلط.' }, { status: 401 });
  }

  writeSessionCookie(who);
  return NextResponse.json({ ok: true });
}
