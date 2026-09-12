import { requireAccess } from '@/lib/requireAccess';
import { RememberPage } from '@/features/places/remember/RememberPage';

export default async function Page() {
  await requireAccess();
  return <RememberPage />;
}
