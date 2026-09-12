import { cookies } from 'next/headers';
import crypto from 'crypto';

// The second gate: a shared passphrase both partners know, checked
// after Supabase Auth succeeds. Independent of the auth session — it's
// just an extra signed cookie flag, cheap to verify on every page.
const COOKIE_NAME = 'ow_passphrase_ok';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(value: string): string {
  const secret = process.env.SITE_SESSION_SECRET;
  if (!secret) throw new Error('SITE_SESSION_SECRET is missing.');
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function hasPassedPassphrase(): boolean {
  const raw = cookies().get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [payload, signature] = raw.split('.');
  return payload === 'ok' && signature === sign('ok');
}

export function markPassphrasePassed() {
  cookies().set(COOKIE_NAME, `ok.${sign('ok')}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}
