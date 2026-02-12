import { useEffect, useState } from 'react';
import { reputationApi } from '../api/reputation-api';
import type { ReputationProfile } from '../model/types';

export function useReputation() {
  const [item, setItem] = useState<ReputationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await reputationApi.getMine();
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai diem uy tin');
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { item, loading, error, refresh };
}
