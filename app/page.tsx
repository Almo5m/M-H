import { requireAccess } from '@/lib/requireAccess';
import { Hub } from '@/features/hub/Hub';

export default async function HomePage() {
  const user = await requireAccess();
  return <Hub user={user} />;
}
