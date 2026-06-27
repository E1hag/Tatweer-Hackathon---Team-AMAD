import { supabase } from '@/lib/supabase';
import type {
  CreateRequestInput,
  MyInterest,
  ResidentOffer,
  Request,
  RequestSummary,
  ToggleInterestResponse,
} from '@/types/database';

export async function fetchRequests(): Promise<RequestSummary[]> {
  const { data, error } = await supabase
    .from('request_summary')
    .select('*')
    .not('status', 'in', '("archived","fulfilled","unfulfilled")')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function fetchRequestById(requestId: string): Promise<RequestSummary | null> {
  const { data, error } = await supabase
    .from('request_summary')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function fetchRequestsByIds(ids: string[]): Promise<RequestSummary[]> {
  if (ids.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('request_summary')
    .select('*')
    .in('id', ids);

  if (error) {
    return [];
  }

  return data ?? [];
}

type OfferJoinerCount = {
  offer_id: string;
};

type OfferBusinessProfile = {
  id: string;
  business_name: string | null;
  full_name: string;
  area: string | null;
  phone: string | null;
};

function countOfferJoiners(joiners: OfferJoinerCount[]) {
  return joiners.reduce<Record<string, number>>((counts, joiner) => {
    counts[joiner.offer_id] = (counts[joiner.offer_id] ?? 0) + 1;
    return counts;
  }, {});
}

function mapProfilesById(profiles: OfferBusinessProfile[]) {
  return profiles.reduce<Record<string, OfferBusinessProfile>>((profileMap, profile) => {
    profileMap[profile.id] = profile;
    return profileMap;
  }, {});
}

export async function fetchOffersForRequest(requestId: string): Promise<ResidentOffer[]> {
  const { data, error } = await supabase
    .from('fulfillment_offers')
    .select('*')
    .eq('request_id', requestId)
    .in('status', ['accepting', 'proposed', 'completed'])
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  const offers = data ?? [];
  const offerIds = offers.map((offer) => offer.id);
  const businessIds = offers
    .map((offer) => offer.business_id)
    .filter((businessId): businessId is string => Boolean(businessId));

  const [joinerResult, profileResult] = await Promise.all([
    offerIds.length > 0
      ? supabase.from('offer_joiners').select('offer_id').in('offer_id', offerIds)
      : Promise.resolve({ data: [], error: null }),
    businessIds.length > 0
      ? supabase.from('profiles').select('id,business_name,full_name,area,phone').in('id', businessIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const joinerCounts = countOfferJoiners((joinerResult.data ?? []) as OfferJoinerCount[]);
  const profileMap = mapProfilesById((profileResult.data ?? []) as OfferBusinessProfile[]);

  return offers.map((offer) => {
    const profile = offer.business_id ? profileMap[offer.business_id] : null;

    return {
      ...offer,
      business_name: profile?.business_name ?? profile?.full_name ?? null,
      business_area: profile?.area ?? null,
      business_phone: profile?.phone ?? null,
      joiner_count: joinerCounts[offer.id] ?? 0,
    };
  });
}

export async function fetchMyInterests(): Promise<MyInterest[]> {
  const { data, error } = await supabase.rpc('my_request_interests');
  console.log('MY INTERESTS:', JSON.stringify({ data, error }));
  if (error) {
    return [];
  }
  return (data ?? []) as MyInterest[];
}

export async function setInterest(
  requestId: string,
  quantity: string,
  neededBy: string,
  note: string
): Promise<ToggleInterestResponse> {
  const { data, error } = await supabase.rpc('set_request_interest', {
    p_request_id: requestId,
    p_quantity: quantity,
    p_needed_by: neededBy,
    p_note: note,
  });

  if (error) {
    throw error;
  }

  return data as ToggleInterestResponse;
}

export async function removeInterest(requestId: string): Promise<ToggleInterestResponse> {
  const { data, error } = await supabase.rpc('remove_request_interest', {
    p_request_id: requestId,
  });

  if (error) {
    throw error;
  }

  return data as ToggleInterestResponse;
}

export async function createRequest(input: CreateRequestInput, userId: string): Promise<Request> {
  const { data, error } = await supabase
    .from('requests')
    .insert({
      ...input,
      is_anonymous: input.is_anonymous ?? false,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function searchSimilarRequests(
  title: string,
  category?: string
): Promise<RequestSummary[]> {
  const { data, error } = await supabase.rpc('search_similar_requests', {
    p_title: title,
    p_category: category ?? null,
  });

  if (error) {
    return [];
  }

  return data ?? [];
}
