import { supabase } from '@/lib/supabase';
import { fetchMyProfile } from '@/services/auth';
import type { PendingConfirmation, Profile } from '@/types/database';

export async function fetchCurrentProfile(userId: string): Promise<Profile | null> {
  const myProfile = await fetchMyProfile();

  if (myProfile?.id === userId) {
    return myProfile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data ?? null;
}

export async function fetchPendingConfirmations(): Promise<PendingConfirmation[]> {
  const { data, error } = await supabase.rpc('my_pending_confirmations');

  if (error) {
    return [];
  }

  return (data ?? []) as PendingConfirmation[];
}

export async function confirmFulfillment(
  joinerId: string,
  confirmed: boolean
): Promise<void> {
  const { error } = await supabase.rpc('confirm_fulfillment', {
    p_joiner_id: joinerId,
    p_confirmed: confirmed,
  });

  if (error) {
    throw error;
  }
}
