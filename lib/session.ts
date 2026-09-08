import { cookies } from 'next/headers';
import crypto from 'crypto';
import type { Partner } from './types';

const COOKIE_NAME = 'ow_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // a year — this is meant to last

function getSecret(): string {
  const secret = process.env.SITE_SESSION_SECRET;
  if (!secret) throw new Error('SITE_SESSION_SECRET is missing.');
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function createSessionValue(who: Partner): string {
  const payload = `${who}`;
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifySessionValue(raw: string | undefined): Partner | null {
  if (!raw) return null;
  const [payload, signature] = raw.split('.');
  if (!payload || !signature) return null;
  if (sign(payload) !== signature) return null;
  if (payload !== 'moaz' && payload !== 'hanona') return null;
  return payload;
}

export function readSession(): Partner | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  return verifySessionValue(raw);
}

export function writeSessionCookie(who: Partner) {
  cookies().set(COOKIE_NAME, createSessionValue(who), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}
