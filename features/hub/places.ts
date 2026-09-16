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
  { key: 'dreams', label: 'أحلامنا', mood: 'حاجات نفسنا نعيشها سوا', href: '/dreams', Icon: DreamsIcon, top: 9, left: 41 },
  { key: 'remember', label: 'نفتكر', mood: 'في تواريخ تستاهل نفتكرها', href: '/remember', Icon: RememberIcon, top: 24, left: 79 },
  { key: 'listen', label: 'نسمع', mood: 'كل أغنية ليها حكاية', href: '/playlist', Icon: ListenIcon, top: 33, left: 15 },
  { key: 'play', label: 'نلعب', mood: 'شوية وقت بعيد عن كل حاجة', href: '/play', Icon: PlayIcon, top: 62, left: 85 },
  { key: 'today', label: 'يومنا', mood: 'حاجات صغيرة بنعملها سوا', href: '/today', Icon: TodayIcon, top: 71, left: 22 },
  { key: 'honesty', label: 'بصراحة', mood: 'في كلام محتاج يتقال بهدوء', href: '/honesty', Icon: HonestyIcon, top: 90, left: 60 },
  { key: 'surprise', label: 'مفاجأة', mood: 'في حاجة مستنياك في وقتها', href: '/surprise', Icon: SurpriseIcon, top: 15, left: 14 },
];
