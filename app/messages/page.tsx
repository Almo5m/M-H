import { requireAccess } from '@/lib/requireAccess';
import { MessagesPage } from '@/features/places/messages/MessagesPage';

export default async function Page() {
  await requireAccess();
  return <MessagesPage />;
}
