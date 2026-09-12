import { requireAccess } from '@/lib/requireAccess';
import { SettingsPage } from '@/features/places/settings/SettingsPage';

export default async function Page() {
  const user = await requireAccess();
  return <SettingsPage user={user} />;
}
