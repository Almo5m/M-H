import { requireAccess } from '@/lib/requireAccess';
import { LudoPage } from '@/features/places/play/games/LudoPage';

export default async function Page() {
  await requireAccess();
  return <LudoPage />;
}
