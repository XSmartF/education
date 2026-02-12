import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { marketplaceApi } from '../api/marketplace-api';
import { marketplaceQueryKeys } from '../model/query-keys';
import { walletQueryKeys } from '@/domains/wallet/model/query-keys';
import { coursesQueryKeys } from '@/domains/courses/model/query-keys';
import { decksQueryKeys } from '@/domains/decks/model/query-keys';

export function useMarketplace() {
  const queryClient = useQueryClient();

  const catalog = useQuery({
    queryKey: marketplaceQueryKeys.catalog,
    queryFn: () => marketplaceApi.listCatalog(),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: marketplaceQueryKeys.catalog });
    void queryClient.invalidateQueries({ queryKey: walletQueryKeys.overview });
    void queryClient.invalidateQueries({ queryKey: coursesQueryKeys.catalog });
    void queryClient.invalidateQueries({ queryKey: decksQueryKeys.published });
  };

  const purchaseCourseMutation = useMutation({
    mutationFn: (id: string) => marketplaceApi.purchaseCourse(id),
    onSuccess: refresh,
  });

  const purchaseDeckMutation = useMutation({
    mutationFn: (id: string) => marketplaceApi.purchaseDeck(id),
    onSuccess: refresh,
  });

  return {
    catalog,
    purchaseCourse: (id: string) => purchaseCourseMutation.mutateAsync(id),
    purchaseDeck: (id: string) => purchaseDeckMutation.mutateAsync(id),
  };
}

