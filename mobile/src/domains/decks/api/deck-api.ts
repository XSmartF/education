import { api } from '@/shared/api/http-client';
import type { CreateDeckCardRequest, CreateDeckRequest, DeckCard, DeckDetail, DeckItem } from '../model/types';

export const deckApi = {
  listPublished: () => api.get<DeckItem[]>('/decks'),
  listMine: () => api.get<DeckItem[]>('/decks/me'),
  get: (id: string) => api.get<DeckDetail>(`/decks/${id}`),
  create: (payload: CreateDeckRequest) => api.post<DeckDetail>('/decks', payload),
  addCard: (id: string, payload: CreateDeckCardRequest) => api.post<DeckCard>(`/decks/${id}/cards`, payload),
  publish: (id: string) => api.post<void>(`/decks/${id}/publish`),
};
