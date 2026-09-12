import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { hasPassedPassphrase } from '@/lib/passphrase';
import { LoginForm } from '@/features/access/LoginForm';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(hasPassedPassphrase() ? '/' : '/unlock');

  return <LoginForm />;
}
