import { requireAccess } from '@/lib/requireAccess';
import { BasraPage } from '@/features/places/play/games/BasraPage';

export default async function Page() {
  await requireAccess();
  return <BasraPage />;
}
