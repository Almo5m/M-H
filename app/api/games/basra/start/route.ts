import { NextResponse } from 'next/server';
import { getCurrentUser, getOtherMember } from '@/lib/auth';
import { getSupabaseUserClient } from '@/lib/supabase/serverClient';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { freshDeck, shuffle } from '@/lib/games/basra';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'مش مسموحلك.' }, { status: 401 });

  const other = await getOtherMember(user.spaceId, user.id);
  if (!other) return NextResponse.json({ error: 'مفيش شريك في المساحة لسه.' }, { status: 400 });

  const userClient = getSupabaseUserClient();
  const admin = getSupabaseServerClient();

  const deck = shuffle(freshDeck());
  const table = deck.splice(0, 4);
  const myHand = deck.splice(0, 4);
  const otherHand = deck.splice(0, 4);

  const { data: match, error } = await userClient
    .from('game_matches')
    .insert({
      space_id: user.spaceId,
      game_key: 'basra',
      state: {
        table,
        captured: { [user.id]: [], [other.id]: [] },
        handCounts: { [user.id]: 4, [other.id]: 4 },
        basraCounts: { [user.id]: 0, [other.id]: 0 },
        deckCount: deck.length,
        lastCaptureBy: null,
      },
      status: 'active',
      turn_user_id: user.id,
      created_by: user.id,
    })
    .select()
    .single();

  if (error || !match) return NextResponse.json({ error: 'فشل بدء اللعبة.' }, { status: 500 });

  // Private data — written with the service-role client so RLS never
  // has to grant the other player access to it.
  await admin.from('game_hands').insert([
    { match_id: match.id, user_id: user.id, cards: myHand },
    { match_id: match.id, user_id: other.id, cards: otherHand },
  ]);
  await admin.from('game_decks').insert({ match_id: match.id, cards: deck });

  return NextResponse.json({ match });
}
