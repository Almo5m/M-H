'use client';

import type { Partner } from '@/lib/types';
import { OpeningScene } from './opening/OpeningScene';
import { WordsScene, HeroScene, YearlyCardsScene, RosesScene } from './intro/StaticScenes';
import { LightMomentScene } from './light-moment/LightMomentScene';
import { JourneyScene } from './journey/JourneyScene';
import { MemoriesScene } from './memories/MemoriesScene';
import { DreamsScene } from './dreams/DreamsScene';
import { ArchiveScene } from './archive/ArchiveScene';
import { LockedMessagesScene } from './messages/LockedMessagesScene';
import { PlaylistScene } from './playlist/PlaylistScene';
import { FinalScene } from './final/FinalScene';
import { ScrollThread } from '@/features/scroll/ScrollThread';
import { AutoScrollController } from '@/features/scroll/AutoScrollController';
import { RevealOnScroll } from '@/features/scroll/RevealOnScroll';

export function Experience({ who }: { who: Partner }) {
  return (
    <main>
      <ScrollThread />
      <AutoScrollController />

      <OpeningScene />
      <RevealOnScroll>
        <LightMomentScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <WordsScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <HeroScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <YearlyCardsScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <JourneyScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <RosesScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <MemoriesScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <DreamsScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <ArchiveScene who={who} />
      </RevealOnScroll>
      <RevealOnScroll>
        <LockedMessagesScene />
      </RevealOnScroll>
      <RevealOnScroll>
        <PlaylistScene />
      </RevealOnScroll>
      <FinalScene />
    </main>
  );
}
