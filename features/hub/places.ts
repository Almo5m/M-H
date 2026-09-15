import type { ComponentType } from 'react';
import { UsIcon, DreamsIcon, RememberIcon, ListenIcon, PlayIcon, TodayIcon, HonestyIcon, SurpriseIcon } from './icons';

export interface Place {
  key: string;
  label: string;
  mood: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
  // desktop position, percentages within the organic layout container
  top: number;
  left: number;
}

export const CENTER_PLACE: Place = {
  key: 'us', label: 'احنا', mood: 'الحاجات اللي بتفكرنا ببعض', href: '/memories',
  Icon: UsIcon, top: 50, left: 50,
};

export const OUTER_PLACES: Place[] = [
  { key: 'dreams', label: 'أحلامنا', mood: 'حاجات نفسنا نعيشها سوا', href: '/dreams', Icon: DreamsIcon, top: 12, left: 32 },
  { key: 'remember', label: 'نفتكر', mood: 'في تواريخ تستاهل نفتكرها', href: '/remember', Icon: RememberIcon, top: 16, left: 68 },
  { key: 'listen', label: 'نسمع', mood: 'كل أغنية ليها حكاية', href: '/playlist', Icon: ListenIcon, top: 50, left: 12 },
  { key: 'play', label: 'نلعب', mood: 'شوية وقت بعيد عن كل حاجة', href: '/play', Icon: PlayIcon, top: 50, left: 88 },
  { key: 'today', label: 'يومنا', mood: 'حاجات صغيرة بنعملها سوا', href: '/today', Icon: TodayIcon, top: 82, left: 30 },
  { key: 'honesty', label: 'بصراحة', mood: 'في كلام محتاج يتقال بهدوء', href: '/honesty', Icon: HonestyIcon, top: 86, left: 70 },
  { key: 'surprise', label: 'مفاجأة', mood: 'في حاجة مستنياك في وقتها', href: '/surprise', Icon: SurpriseIcon, top: 96, left: 50 },
];
