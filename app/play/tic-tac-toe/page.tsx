import { requireAccess } from '@/lib/requireAccess';
import { TicTacToePage } from '@/features/places/play/games/TicTacToePage';

export default async function Page() {
  await requireAccess();
  return <TicTacToePage />;
}
