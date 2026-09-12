import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// The auth-aware, RLS-scoped Supabase client — this is what every
// route/page uses for real reads and writes from now on. It carries the
// signed-in user's session, so Postgres Row Level Security (not this
// code) is what actually decides which rows they can see or touch.
export function getSupabaseUserClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase public credentials are missing.');
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component render — middleware handles
          // the actual refresh in that case, so this is safe to ignore.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          // Same as above.
        }
      },
    },
  });
}
