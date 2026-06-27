import { supabase } from '@/lib/supabase';
import type {
  CreateRequestInput,
  FulfillmentOffer,
  MyInterest,
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

export async function fetchOffersForRequest(requestId: string): Promise<FulfillmentOffer[]> {
  const { data, error } = await supabase
    .from('fulfillment_offers')
    .select('*')
    .eq('request_id', requestId)
    .in('status', ['accepting', 'proposed', 'completed'])
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
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
