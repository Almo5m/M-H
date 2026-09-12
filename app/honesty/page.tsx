import { requireAccess } from '@/lib/requireAccess';
import { HonestyPage } from '@/features/places/honesty/HonestyPage';

export default async function Page() {
  await requireAccess();
  return <HonestyPage />;
}
