import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deckApi } from '../api/deck-api';
import { decksQueryKeys } from '../model/query-keys';
import type { CreateDeckCardRequest, CreateDeckRequest, UpdateDeckRequest } from '../model/types';

export function useDeckCatalog(isAuthenticated: boolean) {
  const queryClient = useQueryClient();

  const published = useQuery({
    queryKey: decksQueryKeys.published,
    queryFn: () => deckApi.listPublished(),
  });

  const mine = useQuery({
    queryKey: decksQueryKeys.mine,
    queryFn: () => deckApi.listMine(),
    enabled: isAuthenticated,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: decksQueryKeys.published });
    void queryClient.invalidateQueries({ queryKey: decksQueryKeys.mine });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateDeckRequest) => deckApi.create(payload),
    onSuccess: refresh,
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => deckApi.publish(id),
    onSuccess: refresh,
  });

  return {
    published,
    mine,
    createDeck: (payload: CreateDeckRequest) =>
      createMutation.mutateAsync(payload).then(() => undefined),
    publishDeck: (id: string) => publishMutation.mutateAsync(id).then(() => undefined),
  };
}

export function useDeckDetail(deckId: string) {
  const queryClient = useQueryClient();

  const detail = useQuery({
    queryKey: decksQueryKeys.detail(deckId),
    queryFn: () => deckApi.get(deckId),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: decksQueryKeys.published });
    void queryClient.invalidateQueries({ queryKey: decksQueryKeys.mine });
    void queryClient.invalidateQueries({ queryKey: decksQueryKeys.detail(deckId) });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateDeckRequest) => deckApi.update(deckId, payload),
    onSuccess: refresh,
  });

  const addCardMutation = useMutation({
    mutationFn: (payload: CreateDeckCardRequest) => deckApi.addCard(deckId, payload),
    onSuccess: refresh,
  });

  const publishMutation = useMutation({
    mutationFn: () => deckApi.publish(deckId),
    onSuccess: refresh,
  });

  return {
    detail,
    updateDeck: (payload: UpdateDeckRequest) =>
      updateMutation.mutateAsync(payload).then(() => undefined),
    addCard: (payload: CreateDeckCardRequest) =>
      addCardMutation.mutateAsync(payload).then(() => undefined),
    publishDeck: () => publishMutation.mutateAsync().then(() => undefined),
  };
}

