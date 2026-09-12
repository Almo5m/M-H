import { requireAccess } from '@/lib/requireAccess';
import { PlaylistPage } from '@/features/places/playlist/PlaylistPage';

export default async function Page() {
  await requireAccess();
  return <PlaylistPage />;
}
