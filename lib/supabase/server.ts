import { createClient } from '@supabase/supabase-js';

// Server-only client. Uses the service role key, which must never reach
// the browser. Every database and storage call in this project goes
// through this client from inside a Route Handler or Server Action —
// the browser never talks to Supabase directly.
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server credentials are missing.');
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
