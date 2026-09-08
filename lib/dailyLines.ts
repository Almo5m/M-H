// A short loving line shown on the hub, rotating once per day so it
// doesn't repeat two days in a row without needing any backend state.
const DAILY_LINES = [
  'من أول ما بقينا احنا، الدنيا بقت أحلى.',
  'كل يوم بينا بيبقى سبب أكتر إننا كمّلنا صح.',
  'مهما بعدنا شوية، القلب فاكر مكانه.',
  'إحنا مش بس ذكريات، إحنا حكاية لسه بتتكتب.',
  'أجمل حاجة إن بكرة كمان هيبقى فيه إحنا.',
  'مفيش مكان أحن من جنبك/جنبك.',
  'كل التفاصيل الصغيرة دي، بحفظها كلها.',
];

export function getDailyLine(): string {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return DAILY_LINES[dayIndex % DAILY_LINES.length];
}

export function getDaysTogether(): number | null {
  const startDate = process.env.RELATIONSHIP_START_DATE;
  if (!startDate) return null;
  const start = new Date(startDate);
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
