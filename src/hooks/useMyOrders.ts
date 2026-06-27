import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchMyInterests, fetchRequestsByIds } from '@/services/requests';
import { confirmFulfillment, fetchPendingConfirmations } from '@/services/profile';
import type { MyInterest, PendingConfirmation, RequestSummary } from '@/types/database';

export interface MyOrder {
  request: RequestSummary;
  interest: MyInterest;
}

export function useMyOrders(userId: string | null) {
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const [confirmations, setConfirmations] = useState<PendingConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      setConfirmations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [interests, nextConfirmations] = await Promise.all([
        fetchMyInterests(),
        fetchPendingConfirmations(),
      ]);
      const requests = await fetchRequestsByIds(interests.map((interest) => interest.request_id));
      const requestMap = new Map(requests.map((request) => [request.id, request]));

      setOrders(
        interests
          .map((interest) => {
            const request = requestMap.get(interest.request_id);
            return request ? { request, interest } : null;
          })
          .filter((order): order is MyOrder => Boolean(order))
      );
      setConfirmations(nextConfirmations);
    } catch (errorObject) {
      setError(errorObject instanceof Error ? errorObject.message : 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    });

    return () => {
      clearTimeout(timer);
    };
  }, [load]);

  const confirm = useCallback(
    async (joinerId: string, confirmed: boolean) => {
      const previousConfirmations = confirmations;
      const nextStatus = confirmed ? 'fulfilled_confirmed' : 'not_fulfilled';

      setActioningId(joinerId);
      setConfirmations((current) =>
        current.map((confirmation) =>
          confirmation.joiner_id === joinerId
            ? { ...confirmation, joiner_status: nextStatus }
            : confirmation
        )
      );

      try {
        await confirmFulfillment(joinerId, confirmed);
      } catch (errorObject) {
        setConfirmations(previousConfirmations);
        throw errorObject;
      } finally {
        setActioningId(null);
      }
    },
    [confirmations]
  );

  const pendingConfirmations = useMemo(
    () => confirmations.filter((confirmation) => confirmation.joiner_status === 'joined'),
    [confirmations]
  );
  const history = useMemo(
    () => confirmations.filter((confirmation) => confirmation.joiner_status !== 'joined'),
    [confirmations]
  );

  return {
    orders,
    confirmations,
    pendingConfirmations,
    history,
    loading,
    error,
    actioningId,
    load,
    confirm,
  };
}
