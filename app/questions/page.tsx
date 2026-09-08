import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { SceneShell } from '@/features/hub/SceneShell';
import { LightMomentScene } from '@/features/scenes/light-moment/LightMomentScene';

export default function QuestionsPage() {
  const who = readSession();
  if (!who) redirect('/');

  return (
    <SceneShell>
      <LightMomentScene />
    </SceneShell>
  );
}
