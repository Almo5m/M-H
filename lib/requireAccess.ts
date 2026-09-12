import { redirect } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from '@/lib/auth';
import { hasPassedPassphrase } from '@/lib/passphrase';

// Every protected page calls this once at the top instead of repeating
// the two-stage redirect logic (Supabase Auth, then the shared passphrase).
export async function requireAccess(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!hasPassedPassphrase()) redirect('/unlock');
  return user;
}
