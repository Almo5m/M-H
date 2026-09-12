import { requireAccess } from '@/lib/requireAccess';
import { PlayPage } from '@/features/places/play/PlayPage';

export default async function Page() {
  await requireAccess();
  return <PlayPage />;
}
