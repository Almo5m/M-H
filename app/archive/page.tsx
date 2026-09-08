import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { SceneShell } from '@/features/hub/SceneShell';
import { ArchiveScene } from '@/features/scenes/archive/ArchiveScene';

export default function ArchivePage() {
  const who = readSession();
  if (!who) redirect('/');

  return (
    <SceneShell>
      <ArchiveScene who={who} />
    </SceneShell>
  );
}
