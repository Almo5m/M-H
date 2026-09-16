// Classic Ludo board on a 15x15 grid. Full 4-color board is rendered
// for authenticity, but only two opposite colors (red & yellow) are
// ever assigned to players in this two-person version.

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface Coord {
  row: number;
  col: number;
}

// The 52-cell shared ring, clockwise, 15x15 grid coordinates.
export const RING_PATH: Coord[] = [
  { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
  { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
  { row: 0, col: 7 },
  { row: 0, col: 8 }, { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 },
  { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 }, { row: 6, col: 14 },
  { row: 7, col: 14 },
  { row: 8, col: 14 }, { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
  { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 14, col: 8 },
  { row: 14, col: 7 },
  { row: 14, col: 6 }, { row: 13, col: 6 }, { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 9, col: 6 },
  { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 }, { row: 8, col: 0 },
  { row: 7, col: 0 },
  { row: 6, col: 0 },
];

export const START_INDEX: Record<LudoColor, number> = { red: 1, green: 14, yellow: 27, blue: 40 };
export const SAFE_INDICES = new Set(Object.values(START_INDEX));

export const HOME_STRETCH: Record<LudoColor, Coord[]> = {
  red: [{ row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }],
  green: [{ row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 }],
  yellow: [{ row: 7, col: 13 }, { row: 7, col: 12 }, { row: 7, col: 11 }, { row: 7, col: 10 }, { row: 7, col: 9 }, { row: 7, col: 8 }],
  blue: [{ row: 13, col: 7 }, { row: 12, col: 7 }, { row: 11, col: 7 }, { row: 10, col: 7 }, { row: 9, col: 7 }, { row: 8, col: 7 }],
};

export const YARD_SLOTS: Record<LudoColor, Coord[]> = {
  red: [{ row: 1.5, col: 1.5 }, { row: 1.5, col: 3.5 }, { row: 3.5, col: 1.5 }, { row: 3.5, col: 3.5 }],
  green: [{ row: 1.5, col: 11.5 }, { row: 1.5, col: 13.5 }, { row: 3.5, col: 11.5 }, { row: 3.5, col: 13.5 }],
  yellow: [{ row: 11.5, col: 11.5 }, { row: 11.5, col: 13.5 }, { row: 13.5, col: 11.5 }, { row: 13.5, col: 13.5 }],
  blue: [{ row: 11.5, col: 1.5 }, { row: 11.5, col: 3.5 }, { row: 13.5, col: 1.5 }, { row: 13.5, col: 3.5 }],
};

export const CENTER: Coord = { row: 7, col: 7 };

// A token's position is one number: -1 = in yard, 0-50 = steps along
// its own ring journey, 51-56 = home stretch cells, 57 = finished.
export function coordFor(color: LudoColor, step: number): Coord {
  if (step < 0) return { row: -1, col: -1 };
  if (step <= 50) return RING_PATH[(START_INDEX[color] + step) % 52];
  if (step <= 56) return HOME_STRETCH[color][step - 51];
  return CENTER;
}

export function isSafeStep(color: LudoColor, step: number): boolean {
  if (step < 0 || step > 50) return true; // yard/home-stretch/finished are always safe
  return SAFE_INDICES.has((START_INDEX[color] + step) % 52);
}

export function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}
