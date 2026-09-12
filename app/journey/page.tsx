import { requireAccess } from '@/lib/requireAccess';
import { JourneyPage } from '@/features/places/journey/JourneyPage';

export default async function Page() {
  await requireAccess();
  return <JourneyPage />;
}
