import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { hasPassedPassphrase } from '@/lib/passphrase';
import { PassphraseGate } from '@/features/access/PassphraseGate';

export default async function UnlockPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (hasPassedPassphrase()) redirect('/');

  return <PassphraseGate />;
}
