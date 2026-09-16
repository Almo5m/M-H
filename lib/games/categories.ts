export const CATEGORY_ORDER = [
  { key: 'boy', label: 'ولد' },
  { key: 'girl', label: 'بنت' },
  { key: 'thing', label: 'جماد' },
  { key: 'plant', label: 'نبات' },
  { key: 'animal', label: 'حيوان' },
  { key: 'country', label: 'بلاد' },
] as const;

export type CategoryKey = (typeof CATEGORY_ORDER)[number]['key'];
export type CategoryAnswers = Partial<Record<CategoryKey, string>>;
export type CategoryScores = Partial<Record<CategoryKey, 0 | 5 | 10>>;

export const ARABIC_LETTERS = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ر', 'ز', 'س', 'ش', 'ص',
  'ط', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي',
];
