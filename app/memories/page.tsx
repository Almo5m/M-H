import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { SceneShell } from '@/features/hub/SceneShell';
import { MemoriesScene } from '@/features/scenes/memories/MemoriesScene';

export default function MemoriesPage() {
  const who = readSession();
  if (!who) redirect('/');

  return (
    <SceneShell>
      <MemoriesScene />
    </SceneShell>
  );
}
