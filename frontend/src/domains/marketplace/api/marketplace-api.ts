import { api } from '@/shared/api/http-client';
import type { MarketplaceCatalogItem, PurchaseItemResult } from '../model/types';

export const marketplaceApi = {
  listCatalog: () => api.get<MarketplaceCatalogItem[]>('/marketplace/catalog'),
  purchaseCourse: (courseId: string) =>
    api.post<PurchaseItemResult>(`/marketplace/courses/${courseId}/purchase`),
  purchaseDeck: (deckId: string) =>
    api.post<PurchaseItemResult>(`/marketplace/decks/${deckId}/purchase`),
};

