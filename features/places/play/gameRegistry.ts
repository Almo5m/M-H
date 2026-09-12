import type { ComponentType } from 'react';

// Each game is one self-contained module. To add a real game later:
// build its play component, then push an entry here — the نلعب page
// and the play-screen routing need no changes.
export interface GameModule {
  key: string;
  title: string;
  description: string;
  players: string;
  Icon: ComponentType<{ className?: string }>;
  PlayComponent: ComponentType<{ onFinish: (result: unknown) => void }>;
}

// Empty on purpose — no games have been decided yet (see the نلعب spec).
export const GAME_REGISTRY: GameModule[] = [];
