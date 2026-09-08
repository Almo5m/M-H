import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Partner } from '@/lib/types';

export async function hasSeenStory(who: Partner): Promise<boolean> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('presence').select('has_seen_story').eq('who', who).maybeSingle();
  return Boolean(data?.has_seen_story);
}
