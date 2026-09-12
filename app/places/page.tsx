import { requireAccess } from '@/lib/requireAccess';
import { PlacesPage } from '@/features/places/places/PlacesPage';

export default async function Page() {
  await requireAccess();
  return <PlacesPage />;
}
