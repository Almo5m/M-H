export function relativeTimeAr(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return 'دلوقتي';
  if (minutes < 60) return `من ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقايق'}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `من ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  const days = Math.floor(hours / 24);
  return `من ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
}
