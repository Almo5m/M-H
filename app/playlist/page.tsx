import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { SceneShell } from '@/features/hub/SceneShell';
import { PlaylistScene } from '@/features/scenes/playlist/PlaylistScene';

export default function PlaylistPage() {
  const who = readSession();
  if (!who) redirect('/');

  return (
    <SceneShell>
      <PlaylistScene />
    </SceneShell>
  );
}
