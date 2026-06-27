export interface Profile {
  id: string;
  full_name: string;
  role: 'resident' | 'business' | 'aspiring_business';
  area: string | null;
  phone: string | null;
  business_name: string | null;
  created_at: string;
}

export type RequestStatus =
  | 'open'
  | 'demand_growing'
  | 'offered'
  | 'scheduled'
  | 'fulfilled'
  | 'unfulfilled';

export type RequestUrgency = 'today' | 'this_week' | 'flexible';

export interface Request {
  id: string;
  title: string;
  description: string | null;
  category: string;
  area: string | null;
  needed_by: string | null;
  urgency: RequestUrgency | null;
  status: RequestStatus;
  created_by: string | null;
  created_at: string;
  is_anonymous: boolean;
}

export interface RequestSummary extends Request {
  interest_count: number;
  offer_count: number;
}

export interface RequestInterest {
  id: string;
  request_id: string;
  user_id: string;
  note: string | null;
  created_at: string;
}

export type OfferStatus = 'proposed' | 'accepting' | 'completed' | 'cancelled';

export interface FulfillmentOffer {
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
}

export interface ResidentOffer extends FulfillmentOffer {
  business_name: string | null;
  business_area: string | null;
  business_phone: string | null;
  joiner_count: number;
}

export interface AvailabilitySummary {
  id: string;
  request_id: string | null;
  business_id: string | null;
  title: string;
  description: string | null;
  capacity: number | null;
  scheduled_for: string | null;
  price_note: string | null;
  status: OfferStatus;
  created_at: string;
  business_name: string | null;
  business_area: string | null;
  business_phone: string | null;
  request_title: string | null;
  request_category: string | null;
  request_area: string | null;
  request_status: string | null;
  interest_count: number;
  offer_count: number;
}

export interface OfferJoiner {
  id: string;
  offer_id: string;
  user_id: string;
  status: 'joined' | 'fulfilled_confirmed' | 'not_fulfilled';
  created_at: string;
}

export interface ToggleInterestResponse {
  joined: boolean;
  interest_count: number;
}

export interface MyInterest {
  request_id: string;
  quantity: string | null;
  needed_by: string | null;
  note: string | null;
}

export interface CreateRequestInput {
  title: string;
  category: string;
  area: string;
  description?: string;
  urgency?: RequestUrgency;
  needed_by?: string;
  is_anonymous?: boolean;
}

export interface PendingConfirmation {
  joiner_id: string;
  joiner_status: 'joined' | 'fulfilled_confirmed' | 'not_fulfilled';
  offer_id: string;
  offer_title: string;
  price_note: string | null;
  business_name: string | null;
  business_area: string | null;
  request_id: string;
  request_title: string;
}
