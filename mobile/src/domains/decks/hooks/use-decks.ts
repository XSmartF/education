import { useCallback, useEffect, useState } from 'react';
import { deckApi } from '../api/deck-api';
import type { CreateDeckRequest, DeckItem } from '../model/types';

type UseDecksResult = {
  published: DeckItem[];
  mine: DeckItem[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  create: (payload: CreateDeckRequest) => Promise<void>;
  publish: (id: string) => Promise<void>;
};

export function useDecks(isAuthenticated: boolean): UseDecksResult {
  const [published, setPublished] = useState<DeckItem[]>([]);
  const [mine, setMine] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [publishedItems, myItems] = await Promise.all([
        deckApi.listPublished(),
        isAuthenticated ? deckApi.listMine() : Promise.resolve([]),
      ]);
      setPublished(publishedItems);
      setMine(myItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai deck');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const create = async (payload: CreateDeckRequest) => {
    await deckApi.create(payload);
    await refresh();
  };

  const publish = async (id: string) => {
    await deckApi.publish(id);
    await refresh();
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { published, mine, loading, error, refresh, create, publish };
}
