import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  fetchMyInterests,
  fetchOffersForRequest,
  fetchRequestById,
  removeInterest,
  setInterest,
} from '@/services/requests';
import type { MyInterest, RequestSummary, ResidentOffer } from '@/types/database';

export function useRequestDetails(requestId: string, userId: string | null) {
  const [request, setRequest] = useState<RequestSummary | null>(null);
  const [offers, setOffers] = useState<ResidentOffer[]>([]);
  const [myInterest, setMyInterest] = useState<MyInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextRequest, nextOffers, nextInterests] = await Promise.all([
        fetchRequestById(requestId),
        fetchOffersForRequest(requestId),
        userId ? fetchMyInterests() : Promise.resolve([]),
      ]);

      setRequest(nextRequest);
      setOffers(nextOffers);
      setMyInterest(nextInterests.find((interest) => interest.request_id === requestId) ?? null);
    } catch (errorObject) {
      setError(errorObject instanceof Error ? errorObject.message : 'Unable to load request.');
    } finally {
      setLoading(false);
    }
  }, [requestId, userId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    });

    return () => {
      clearTimeout(timer);
    };
  }, [load]);

  const assertSignedIn = useCallback(() => {
    if (userId) {
      return true;
    }

    Alert.alert('Sign in required', 'You need to be signed in to join a request.');
    return false;
  }, [userId]);

  const submitInterest = useCallback(
    async (quantity: string, neededBy: string, note: string) => {
      if (!assertSignedIn()) {
        return;
      }

      const previousRequest = request;
      const previousInterest = myInterest;
      const wasJoined = Boolean(myInterest);
      const nextInterest: MyInterest = {
        request_id: requestId,
        quantity,
        needed_by: neededBy,
        note: note || null,
      };

      setSubmitting(true);
      setMyInterest(nextInterest);
      if (!wasJoined) {
        setRequest((current) =>
          current ? { ...current, interest_count: current.interest_count + 1 } : current
        );
      }

      try {
        const response = await setInterest(requestId, quantity, neededBy, note);
        setRequest((current) =>
          current ? { ...current, interest_count: response.interest_count } : current
        );
      } catch (errorObject) {
        setRequest(previousRequest);
        setMyInterest(previousInterest);
        throw errorObject;
      } finally {
        setSubmitting(false);
      }
    },
    [assertSignedIn, myInterest, request, requestId]
  );

  const leaveInterest = useCallback(async () => {
    if (!assertSignedIn()) {
      return;
    }

    const previousRequest = request;
    const previousInterest = myInterest;

    setSubmitting(true);
    setMyInterest(null);
    setRequest((current) =>
      current ? { ...current, interest_count: Math.max(0, current.interest_count - 1) } : current
    );

    try {
      const response = await removeInterest(requestId);
      setRequest((current) =>
        current ? { ...current, interest_count: response.interest_count } : current
      );
    } catch (errorObject) {
      setRequest(previousRequest);
      setMyInterest(previousInterest);
      throw errorObject;
    } finally {
      setSubmitting(false);
    }
  }, [assertSignedIn, myInterest, request, requestId]);

  return {
    request,
    offers,
    myInterest,
    loading,
    error,
    submitting,
    load,
    submitInterest,
    leaveInterest,
  };
}
