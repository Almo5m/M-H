import type { ComponentType } from 'react';
import { TicTacToeIcon, CategoriesIcon, CardsGameIcon, LudoIcon } from '@/features/hub/icons';

export interface GameEntry {
  key: string;
  title: string;
  description: string;
  players: string;
  href: string;
  Icon: ComponentType<{ className?: string }>;
  ready: boolean;
}

export const GAME_REGISTRY: GameEntry[] = [
  { key: 'tic_tac_toe', title: 'X O', description: 'الكلاسيكية، بس بينا احنا.', players: 'إتنين', href: '/play/tic-tac-toe', Icon: TicTacToeIcon, ready: true },
  { key: 'categories', title: 'أتوبيس كومبليت', description: 'ولد، بنت، جماد، نبات، حيوان، بلاد.', players: 'إتنين', href: '/play/categories', Icon: CategoriesIcon, ready: true },
  { key: 'basra', title: 'الباصرة', description: 'لعبة الورق اللي بنعرفها.', players: 'إتنين', href: '/play/basra', Icon: CardsGameIcon, ready: true },
  { key: 'ludo', title: 'ليدو', description: 'اللوحة الكاملة، بلونين بيناتنا.', players: 'إتنين', href: '/play/ludo', Icon: LudoIcon, ready: true },
];
