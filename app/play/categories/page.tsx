import { requireAccess } from '@/lib/requireAccess';
import { CategoriesPage } from '@/features/places/play/games/CategoriesPage';

export default async function Page() {
  await requireAccess();
  return <CategoriesPage />;
}
