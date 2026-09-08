import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { hasSeenStory } from '@/lib/hasSeenStory';
import { PasswordGate } from '@/features/access/PasswordGate';
import { Hub } from '@/features/hub/Hub';

export default async function HomePage() {
  const who = readSession();

  if (!who) {
    return <PasswordGate />;
  }

  if (!(await hasSeenStory(who))) {
    redirect('/story');
  }

  return <Hub who={who} />;
}
