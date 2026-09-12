import { requireAccess } from '@/lib/requireAccess';
import { MemoriesPage } from '@/features/places/memories/MemoriesPage';

export default async function Page() {
  await requireAccess();
  return <MemoriesPage />;
}
