import { requireAccess } from '@/lib/requireAccess';
import { MomentPage } from '@/features/places/moment/MomentPage';

export default async function Page() {
  await requireAccess();
  return <MomentPage />;
}
