import { useCallback, useState } from 'react';

import { fetchBusinessBoard, type BusinessOffer } from '@/services/business';
import type { RequestSummary } from '@/types/database';
import { sortRequestsForBusiness } from '@/utils/businessDisplay';

export function useBusinessBoard() {
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [offers, setOffers] = useState<BusinessOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadBoard = useCallback(async ({ showSpinner = false } = {}) => {
    if (showSpinner) {
      setLoading(true);
    }

    setError('');

    try {
      const board = await fetchBusinessBoard();
      setRequests(sortRequestsForBusiness(board.requests));
      setOffers(board.offers);
    } catch (errorObject) {
      setError(
        errorObject instanceof Error
          ? errorObject.message
          : 'Unable to load the business dashboard right now.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    void loadBoard();
  }, [loadBoard]);

  return {
    error,
    loading,
    loadBoard,
    offers,
    refreshing,
    refresh,
    requests,
  };
}
