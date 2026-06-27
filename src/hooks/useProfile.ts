import { useCallback, useEffect, useState } from 'react';

import { demoUsers } from '@/constants/demoUsers';
import { fetchCurrentProfile } from '@/services/profile';
import type { Profile } from '@/types/database';

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Pick<Profile, 'id' | 'full_name' | 'role' | 'area'> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextProfile = await fetchCurrentProfile(userId);

      setProfile(nextProfile ?? demoUsers.find((user) => user.id === userId) ?? null);
    } catch (errorObject) {
      setError(errorObject instanceof Error ? errorObject.message : 'Unable to load profile.');
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

  return {
    profile,
    loading,
    error,
    load,
  };
}
