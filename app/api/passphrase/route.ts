import { NextRequest, NextResponse } from 'next/server';
import { markPassphrasePassed } from '@/lib/passphrase';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const passphrase: string | undefined = body?.passphrase;

  if (!passphrase || passphrase !== process.env.SHARED_PASSPHRASE) {
    return NextResponse.json({ error: 'مش هي.' }, { status: 401 });
  }

  markPassphrasePassed();
  return NextResponse.json({ ok: true });
}
