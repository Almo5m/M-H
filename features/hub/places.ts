import type { ComponentType } from 'react';
import {
  UsIcon, JourneyIcon, MessageIcon, TodayIcon, PlayIcon, ListenIcon,
  DreamsIcon, HonestyIcon, PlacesIcon, SurpriseIcon, MomentIcon, RememberIcon,
} from './icons';

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
  { key: 'dreams', label: 'أحلامنا', mood: 'حاجات نفسنا نعيشها سوا', href: '/dreams', Icon: DreamsIcon, top: 10, left: 38 },
  { key: 'remember', label: 'نفتكر', mood: 'في تواريخ تستاهل نفتكرها', href: '/remember', Icon: RememberIcon, top: 14, left: 66 },
  { key: 'listen', label: 'نسمع', mood: 'كل أغنية ليها حكاية', href: '/playlist', Icon: ListenIcon, top: 28, left: 18 },
  { key: 'message', label: 'رسالة', mood: 'في كلام بيستنى وقته', href: '/messages', Icon: MessageIcon, top: 26, left: 78 },
  { key: 'places', label: 'أماكننا', mood: 'كل مكان له حكاية', href: '/places', Icon: PlacesIcon, top: 50, left: 10 },
  { key: 'journey', label: 'رحلتنا', mood: 'لسه الحكاية في أولها', href: '/journey', Icon: JourneyIcon, top: 48, left: 88 },
  { key: 'play', label: 'نلعب', mood: 'شوية وقت بعيد عن كل حاجة', href: '/play', Icon: PlayIcon, top: 70, left: 22 },
  { key: 'moment', label: 'لحظة', mood: 'قبل ما تعدّي... نخليها تفضل', href: '/moment', Icon: MomentIcon, top: 72, left: 76 },
  { key: 'today', label: 'يومنا', mood: 'حاجات صغيرة بنعملها سوا', href: '/today', Icon: TodayIcon, top: 88, left: 34 },
  { key: 'honesty', label: 'بصراحة', mood: 'في كلام محتاج يتقال بهدوء', href: '/honesty', Icon: HonestyIcon, top: 90, left: 62 },
  { key: 'surprise', label: 'مفاجأة', mood: 'في حاجة مستنياك في وقتها', href: '/surprise', Icon: SurpriseIcon, top: 97, left: 48 },
];
