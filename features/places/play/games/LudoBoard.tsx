'use client';

import { RING_PATH, HOME_STRETCH, YARD_SLOTS, CENTER, SAFE_INDICES, START_INDEX, coordFor, type LudoColor } from '@/lib/games/ludo';

const COLOR_HEX: Record<LudoColor, string> = {
  red: '#C97B6E',
  green: '#8FAE7D',
  yellow: '#E3C567',
  blue: '#7B93B0',
};

const COLORS: LudoColor[] = ['red', 'green', 'yellow', 'blue'];

interface LudoBoardProps {
  colors: Record<string, LudoColor>;
  tokens: Record<string, number[]>;
  myId: string;
  otherId: string;
  movableIndices: number[];
  onTokenClick: (index: number) => void;
}

export function LudoBoard({ colors, tokens, myId, otherId, movableIndices, onTokenClick }: LudoBoardProps) {
  const myColor = colors[myId];
  const otherColor = colors[otherId];

  return (
    <svg viewBox="0 0 15 15" className="mx-auto w-full max-w-md">
      <rect x="0" y="0" width="15" height="15" rx="0.6" fill="#FFFBF6" />

      {/* corner yards */}
      <rect x="0.4" y="0.4" width="5.2" height="5.2" rx="0.5" fill={COLOR_HEX.red} opacity="0.22" />
      <rect x="9.4" y="0.4" width="5.2" height="5.2" rx="0.5" fill={COLOR_HEX.green} opacity="0.22" />
      <rect x="9.4" y="9.4" width="5.2" height="5.2" rx="0.5" fill={COLOR_HEX.yellow} opacity="0.22" />
      <rect x="0.4" y="9.4" width="5.2" height="5.2" rx="0.5" fill={COLOR_HEX.blue} opacity="0.22" />

      {/* ring path cells */}
      {RING_PATH.map((coord, index) => (
        <rect
          key={`ring-${index}`}
          x={coord.col + 0.06}
          y={coord.row + 0.06}
          width="0.88"
          height="0.88"
          rx="0.15"
          fill={SAFE_INDICES.has(index) ? '#EFE1D0' : '#FFFBF6'}
          stroke="#8E6873"
          strokeOpacity="0.12"
        />
      ))}

      {/* home stretches */}
      {COLORS.map((color) =>
        HOME_STRETCH[color].map((coord, index) => (
          <rect
            key={`${color}-home-${index}`}
            x={coord.col + 0.06}
            y={coord.row + 0.06}
            width="0.88"
            height="0.88"
            fill={COLOR_HEX[color]}
            opacity="0.45"
          />
        )),
      )}

      {/* center */}
      <rect x={CENTER.col + 0.15} y={CENTER.row + 0.15} width="0.7" height="0.7" rx="0.15" fill="#C7A96B" />

      {/* tokens */}
      {[myId, otherId].map((userId) => {
        const color = colors[userId];
        return tokens[userId]?.map((step, tokenIndex) => {
          const isMine = userId === myId;
          const isMovable = isMine && movableIndices.includes(tokenIndex);
          const coord = step === -1 ? YARD_SLOTS[color][tokenIndex] : coordFor(color, step);

          return (
            <circle
              key={`${userId}-${tokenIndex}`}
              cx={coord.col + 0.5}
              cy={coord.row + 0.5}
              r={isMovable ? 0.32 : 0.26}
              fill={COLOR_HEX[color]}
              stroke={isMovable ? '#40383A' : '#FFFBF6'}
              strokeWidth={isMovable ? 0.06 : 0.05}
              className={isMovable ? 'cursor-pointer' : ''}
              onClick={() => isMovable && onTokenClick(tokenIndex)}
            />
          );
        });
      })}
    </svg>
  );
}
