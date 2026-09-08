import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { SceneShell } from '@/features/hub/SceneShell';
import { LockedMessagesScene } from '@/features/scenes/messages/LockedMessagesScene';

export default function MessagesPage() {
  const who = readSession();
  if (!who) redirect('/');

  return (
    <SceneShell>
      <LockedMessagesScene />
    </SceneShell>
  );
}
