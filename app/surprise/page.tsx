import { requireAccess } from '@/lib/requireAccess';
import { SurprisePage } from '@/features/places/surprise/SurprisePage';

export default async function Page() {
  await requireAccess();
  return <SurprisePage />;
}
