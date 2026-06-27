import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { demoRequests } from '@/data/demoRequests';
import { hasSupabaseConfig } from '@/lib/supabase';
import {
  fetchMyInterests,
  fetchRequests,
  removeInterest,
  setInterest,
} from '@/services/requests';
import type { MyInterest, RequestSummary } from '@/types/database';

export function useRequests(userId: string | null) {
  const [requests, setRequests] = useState<RequestSummary[]>([]);
  const [myInterests, setMyInterests] = useState<Record<string, MyInterest>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        if (!hasSupabaseConfig) {
          setRequests(demoRequests);
          setMyInterests({});
          return;
        }

        const [nextRequests, nextInterests] = await Promise.all([
          fetchRequests(),
          userId ? fetchMyInterests() : Promise.resolve([]),
        ]);

        setRequests(nextRequests);
        setMyInterests(
          Object.fromEntries(nextInterests.map((interest) => [interest.request_id, interest]))
        );
      } catch {
        setRequests(demoRequests);
        setMyInterests({});
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    });

    return () => {
      clearTimeout(timer);
    };
  }, [load]);

  const filteredRequests = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (trimmedQuery.length === 0) {
      return requests;
    }

    return requests.filter(
      (request) =>
        request.title.toLowerCase().includes(trimmedQuery) ||
        Boolean(request.description?.toLowerCase().includes(trimmedQuery))
    );
  }, [requests, searchQuery]);

  const searchIsActive = searchQuery.trim().length > 0;
  const noMatches = searchIsActive && filteredRequests.length === 0;

  const trendingRequests = useMemo(() => {
    if (searchIsActive) {
      return [];
    }

    return [...filteredRequests]
      .sort((first, second) => second.interest_count - first.interest_count)
      .slice(0, 3);
  }, [filteredRequests, searchIsActive]);

  const recentRequests = useMemo(() => {
    if (searchIsActive) {
      return filteredRequests;
    }

    return [...filteredRequests].sort(
      (first, second) =>
        new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
    );
  }, [filteredRequests, searchIsActive]);

  const assertSignedIn = useCallback(() => {
    if (userId) {
      return true;
    }

    Alert.alert('Sign in required', 'You need to be signed in to join a request.');
    return false;
  }, [userId]);

  const submitInterest = useCallback(
    async (requestId: string, quantity: string, neededBy: string, note: string) => {
      if (!assertSignedIn()) {
        return;
      }

      const wasJoined = Boolean(myInterests[requestId]);
      const previousInterests = myInterests;
      const previousRequests = requests;
      const nextInterest: MyInterest = {
        request_id: requestId,
        quantity,
        needed_by: neededBy,
        note: note || null,
      };

      setMyInterests((current) => ({ ...current, [requestId]: nextInterest }));
      if (!wasJoined) {
        setRequests((current) =>
          current.map((request) =>
            request.id === requestId
              ? { ...request, interest_count: request.interest_count + 1 }
              : request
          )
        );
      }

      try {
        const response = await setInterest(requestId, quantity, neededBy, note);
        setRequests((current) =>
          current.map((request) =>
            request.id === requestId
              ? { ...request, interest_count: response.interest_count }
              : request
          )
        );
      } catch (errorObject) {
        setMyInterests(previousInterests);
        setRequests(previousRequests);
        throw errorObject;
      }
    },
    [assertSignedIn, myInterests, requests]
  );

  const leaveInterest = useCallback(
    async (requestId: string) => {
      if (!assertSignedIn()) {
        return;
      }

      const previousInterests = myInterests;
      const previousRequests = requests;

      setMyInterests((current) => {
        const next = { ...current };
        delete next[requestId];
        return next;
      });
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, interest_count: Math.max(0, request.interest_count - 1) }
            : request
        )
      );

      try {
        const response = await removeInterest(requestId);
        setRequests((current) =>
          current.map((request) =>
            request.id === requestId
              ? { ...request, interest_count: response.interest_count }
              : request
          )
        );
      } catch (errorObject) {
        setMyInterests(previousInterests);
        setRequests(previousRequests);
        throw errorObject;
      }
    },
    [assertSignedIn, myInterests, requests]
  );

  const refresh = useCallback(() => load(true), [load]);

  return {
    requests,
    myInterests,
    userInterests: Object.keys(myInterests),
    loading,
    refreshing,
    error,
    searchQuery,
    filteredRequests,
    trendingRequests,
    recentRequests,
    noMatches,
    load,
    assertSignedIn,
    submitInterest,
    leaveInterest,
    setSearchQuery,
    refresh,
  };
}
