import { redirect } from 'next/navigation';
import { readSession } from '@/lib/session';
import { Experience } from '@/features/scenes/Experience';

export default function StoryPage() {
  const who = readSession();
  if (!who) redirect('/');

  return <Experience who={who} />;
}
