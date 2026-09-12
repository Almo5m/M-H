import { getSupabaseUserClient } from '@/lib/supabase/serverClient';

export interface CurrentUser {
  id: string;
  displayName: string;
  spaceId: string;
}

// The one place every page/route asks "who is this and what's their
// space" — everything downstream relies on auth.uid() via RLS, this
// just gives server code the same answer for convenience (e.g. to
// look up the other partner).
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = getSupabaseUserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle();

  const { data: membership } = await supabase
    .from('space_members')
    .select('space_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) return null;

  return {
    id: user.id,
    displayName: profile?.display_name ?? user.email ?? 'إنتي/إنت',
    spaceId: membership.space_id,
  };
}

export async function getOtherMember(spaceId: string, userId: string) {
  const supabase = getSupabaseUserClient();
  const { data } = await supabase
    .from('space_members')
    .select('user_id, profiles(display_name)')
    .eq('space_id', spaceId)
    .neq('user_id', userId)
    .maybeSingle();

  if (!data) return null;
  return { id: data.user_id, displayName: (data as any).profiles?.display_name ?? null };
}
