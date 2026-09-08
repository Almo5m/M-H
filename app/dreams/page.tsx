import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { SceneShell } from '@/features/hub/SceneShell';
import { DreamsScene } from '@/features/scenes/dreams/DreamsScene';

export default function DreamsPage() {
  const who = readSession();
  if (!who) redirect('/');

  return (
    <SceneShell>
      <DreamsScene />
    </SceneShell>
  );
}
