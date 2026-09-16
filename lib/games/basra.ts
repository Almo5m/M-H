export type Card = string; // e.g. "7d", "Ah", "Ks" — rank + suit

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const SUITS = ['h', 'd', 'c', 's']; // hearts, diamonds, clubs(كباين/نبيت), spades(بستوني)

export function freshDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) deck.push(`${rank}${suit}`);
  }
  return deck;
}

export function shuffle<T>(items: T[]): T[] {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function rankOf(card: Card): string {
  return card.slice(0, -1);
}

export function suitOf(card: Card): string {
  return card.slice(-1);
}

export function isFaceCard(card: Card): boolean {
  return ['J', 'Q', 'K'].includes(rankOf(card));
}

// Ace = 1 always, numbers = face value, J/Q/K have no numeric sum-value
// (they only ever capture by matching rank) — per the agreed ruleset.
export function numericValue(card: Card): number | null {
  const rank = rankOf(card);
  if (rank === 'A') return 1;
  if (rank === 'J' || rank === 'Q' || rank === 'K') return null;
  return parseInt(rank, 10);
}

const SUIT_LABEL: Record<string, string> = { h: '♥', d: '♦', c: '♣', s: '♠' };
const RANK_LABEL: Record<string, string> = { A: 'A', J: 'ولد', Q: 'بنت', K: 'شيخ' };

export function displayCard(card: Card): string {
  const rank = rankOf(card);
  const suit = suitOf(card);
  return `${RANK_LABEL[rank] ?? rank}${SUIT_LABEL[suit]}`;
}

// Validates a proposed capture: selected table cards must either all
// match the played card's rank, or (for non-face played cards) sum
// exactly to its numeric value using only non-face table cards.
export function isValidCapture(playedCard: Card, selected: Card[]): boolean {
  if (selected.length === 0) return true; // trailing — always allowed
  const playedRank = rankOf(playedCard);

  if (selected.every((card) => rankOf(card) === playedRank)) return true;

  const playedValue = numericValue(playedCard);
  if (playedValue === null) return false; // face cards never sum-capture
  if (selected.some((card) => isFaceCard(card))) return false;

  const sum = selected.reduce((total, card) => total + (numericValue(card) ?? 0), 0);
  return sum === playedValue;
}
