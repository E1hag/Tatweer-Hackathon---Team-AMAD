import { supabase } from '@/lib/supabase';
import type { OfferStatus, Profile, RequestStatus, RequestSummary } from '@/types/database';

export interface BusinessOfferJoiner {
  offer_id: string;
  user_id: string;
  status: 'joined' | 'fulfilled_confirmed' | 'not_fulfilled';
  profile: Pick<Profile, 'area' | 'full_name' | 'id'> | null;
}

export interface BusinessOffer {
  id: string;
  request_id: string;
  business_id: string | null;
  title: string;
  description: string | null;
  capacity: number | null;
  scheduled_for: string | null;
  price_note: string | null;
  status: OfferStatus;
  created_at: string;
  joiner_count: number;
  joiners: BusinessOfferJoiner[];
}

export interface CreateBusinessOfferInput {
  requestId: string;
  businessId: string;
  title: string;
  description: string | null;
  capacity: number | null;
  scheduledFor: string | null;
  priceNote: string | null;
}

type OfferJoinerRow = {
  offer_id: string;
  user_id: string;
  status: BusinessOfferJoiner['status'];
};

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const value = String(item[key]);
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function profilesById(profiles: Pick<Profile, 'area' | 'full_name' | 'id'>[]) {
  return profiles.reduce<Record<string, Pick<Profile, 'area' | 'full_name' | 'id'>>>(
    (profilesMap, profile) => {
      profilesMap[profile.id] = profile;
      return profilesMap;
    },
    {}
  );
}

export async function fetchBusinessBoard() {
  const [requestResult, offerResult, joinerResult, profileResult] = await Promise.all([
    supabase
      .from('request_summary')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase
      .from('fulfillment_offers')
      .select('id,request_id,business_id,title,description,capacity,scheduled_for,price_note,status,created_at')
      .order('created_at', { ascending: false }),
    supabase.from('offer_joiners').select('offer_id,user_id,status'),
    supabase.from('profiles').select('id,full_name,area'),
  ]);

  const error =
    requestResult.error || offerResult.error || joinerResult.error || profileResult.error;

  if (error) {
    throw error;
  }

  const joiners = (joinerResult.data ?? []) as OfferJoinerRow[];
  const joinerCounts = countBy(joiners, 'offer_id');
  const profileMap = profilesById((profileResult.data ?? []) as Pick<Profile, 'area' | 'full_name' | 'id'>[]);
  const offers = (offerResult.data ?? []).map((offer) => ({
    ...offer,
    joiner_count: joinerCounts[offer.id] ?? 0,
    joiners: joiners
      .filter((joiner) => joiner.offer_id === offer.id)
      .map((joiner) => ({
        ...joiner,
        profile: profileMap[joiner.user_id] ?? null,
      })),
  })) as BusinessOffer[];

  return {
    requests: (requestResult.data ?? []) as RequestSummary[],
    offers,
  };
}

export async function createBusinessOffer(input: CreateBusinessOfferInput) {
  const { error } = await supabase.from('fulfillment_offers').insert({
    request_id: input.requestId,
    business_id: input.businessId,
    title: input.title,
    description: input.description,
    capacity: input.capacity,
    scheduled_for: input.scheduledFor,
    price_note: input.priceNote,
    status: 'accepting',
  });

  if (error) {
    throw error;
  }

  await supabase.from('requests').update({ status: 'offered' }).eq('id', input.requestId);
}

export async function updateBusinessOfferStatus(
  offer: Pick<BusinessOffer, 'id' | 'request_id'>,
  status: OfferStatus
) {
  const { error } = await supabase.from('fulfillment_offers').update({ status }).eq('id', offer.id);

  if (error) {
    throw error;
  }

  if (status === 'completed') {
    await supabase
      .from('requests')
      .update({ status: 'fulfilled' satisfies RequestStatus })
      .eq('id', offer.request_id);
  }
}
