import { requireAccess } from '@/lib/requireAccess';
import { TodayPage } from '@/features/places/today/TodayPage';

export default async function Page() {
  await requireAccess();
  return <TodayPage />;
}
