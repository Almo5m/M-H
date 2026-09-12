import { requireAccess } from '@/lib/requireAccess';
import { DreamsPage } from '@/features/places/dreams/DreamsPage';

export default async function Page() {
  await requireAccess();
  return <DreamsPage />;
}
