import { useCallback, useEffect, useState } from 'react';
import { deckApi } from '../api/deck-api';
import type { CreateDeckCardRequest, DeckDetail } from '../model/types';

type UseDeckDetailResult = {
  item: DeckDetail | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addCard: (payload: CreateDeckCardRequest) => Promise<void>;
  publish: () => Promise<void>;
};

export function useDeckDetail(deckId: string): UseDeckDetailResult {
  const [item, setItem] = useState<DeckDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await deckApi.get(deckId);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai chi tiet deck');
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  const addCard = async (payload: CreateDeckCardRequest) => {
    await deckApi.addCard(deckId, payload);
    await refresh();
  };

  const publish = async () => {
    await deckApi.publish(deckId);
    await refresh();
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { item, loading, error, refresh, addCard, publish };
}
