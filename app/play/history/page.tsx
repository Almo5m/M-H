import { requireAccess } from '@/lib/requireAccess';
import { HistoryPage } from '@/features/places/play/HistoryPage';

export default async function Page() {
  await requireAccess();
  return <HistoryPage />;
}
