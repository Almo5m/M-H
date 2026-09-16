export function getDaysTogether(relationshipStartDate: string | null): number | null {
  if (!relationshipStartDate) return null;
  const start = new Date(relationshipStartDate);
  if (Number.isNaN(start.getTime())) return null;
  const diffMs = Date.now() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'سهرانين لحد دلوقتي؟';
  if (hour < 12) return 'صباح النور يا';
  if (hour < 17) return 'يومك سعيد يا';
  return 'مساء الخير يا';
}
