import { useEffect, useState } from 'react';
import { marketplaceApi } from '../api/marketplace-api';
import type { MarketplaceCatalogItem, PurchaseItemResult } from '../model/types';

type UseMarketplaceResult = {
  items: MarketplaceCatalogItem[];
  loading: boolean;
  error: string;
  latestResult: PurchaseItemResult | null;
  refresh: () => Promise<void>;
  purchase: (itemId: string, itemType: 'course' | 'deck') => Promise<void>;
};

export function useMarketplace(): UseMarketplaceResult {
  const [items, setItems] = useState<MarketplaceCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [latestResult, setLatestResult] = useState<PurchaseItemResult | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await marketplaceApi.listCatalog();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai danh muc');
    } finally {
      setLoading(false);
    }
  };

  const purchase = async (itemId: string, itemType: 'course' | 'deck') => {
    const result =
      itemType === 'course'
        ? await marketplaceApi.purchaseCourse(itemId)
        : await marketplaceApi.purchaseDeck(itemId);
    setLatestResult(result);
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { items, loading, error, latestResult, refresh, purchase };
}
