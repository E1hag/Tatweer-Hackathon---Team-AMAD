import { colors } from '@/constants/theme';
import type { OfferStatus, RequestStatus, RequestSummary, RequestUrgency } from '@/types/database';

export const requestStatusFilters: { label: string; value: RequestStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Demand growing', value: 'demand_growing' },
  { label: 'Offered', value: 'offered' },
  { label: 'Fulfilled', value: 'fulfilled' },
];

export function formatValue(value: string | null | undefined, fallback = 'Not set') {
  return value && value.trim().length > 0 ? value : fallback;
}

export function formatStatus(value: string) {
  return value.replace('_', ' ');
}

export function formatUrgency(value: RequestUrgency | null) {
  if (value === 'today') return 'Today';
  if (value === 'this_week') return 'This week';
  return 'Flexible';
}

export function formatSchedule(value: string | null) {
  if (!value) return 'Schedule TBD';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isEditableOfferStatus(status: OfferStatus) {
  return status === 'accepting' || status === 'proposed';
}

export function isValidSchedule(value: string) {
  if (!value.trim()) return true;
  return !Number.isNaN(Date.parse(value.trim().replace(' ', 'T')));
}

export function sortRequestsForBusiness(requests: RequestSummary[]) {
  return [...requests].sort((first, second) => {
    const interestDelta = second.interest_count - first.interest_count;
    if (interestDelta !== 0) return interestDelta;
    return second.offer_count - first.offer_count;
  });
}

export function getOfferStatusMeta(status: OfferStatus) {
  if (status === 'accepting') {
    return { label: 'Active', backgroundColor: colors.statusOpenBg, color: colors.statusOpenText };
  }

  if (status === 'proposed') {
    return { label: 'Proposed', backgroundColor: colors.statusOfferedBg, color: colors.statusOfferedText };
  }

  if (status === 'completed') {
    return { label: 'Completed', backgroundColor: colors.statusFulfilledBg, color: colors.statusFulfilledText };
  }

  return { label: 'Cancelled', backgroundColor: colors.urgencyTodayBg, color: colors.urgencyTodayText };
}

export function getRequestStatusMeta(status: RequestStatus) {
  if (status === 'open' || status === 'demand_growing') {
    return { label: 'Open', backgroundColor: colors.statusOpenBg, color: colors.statusOpenText };
  }

  if (status === 'offered' || status === 'scheduled') {
    return { label: status === 'scheduled' ? 'Scheduled' : 'Offered', backgroundColor: colors.statusOfferedBg, color: colors.statusOfferedText };
  }

  if (status === 'fulfilled') {
    return { label: 'Fulfilled', backgroundColor: colors.statusClosedBg, color: colors.statusClosedText };
  }

  return { label: 'Closed', backgroundColor: colors.statusClosedBg, color: colors.statusClosedText };
}
