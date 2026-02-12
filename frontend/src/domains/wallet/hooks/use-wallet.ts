import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { walletApi } from '../api/wallet-api';
import { walletQueryKeys } from '../model/query-keys';
import type { CreateWithdrawalRequest, ReviewWithdrawalRequest, TopUpWalletRequest } from '../model/types';

export function useWallet(isAdmin: boolean) {
  const queryClient = useQueryClient();

  const overview = useQuery({
    queryKey: walletQueryKeys.overview,
    queryFn: () => walletApi.getOverview(),
  });

  const pendingWithdrawals = useQuery({
    queryKey: walletQueryKeys.pendingWithdrawals,
    queryFn: () => walletApi.listPendingWithdrawals(),
    enabled: isAdmin,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: walletQueryKeys.overview });
    void queryClient.invalidateQueries({ queryKey: walletQueryKeys.pendingWithdrawals });
  };

  const topUpMutation = useMutation({
    mutationFn: (payload: TopUpWalletRequest) => walletApi.topUp(payload),
    onSuccess: refresh,
  });

  const withdrawalMutation = useMutation({
    mutationFn: (payload: CreateWithdrawalRequest) => walletApi.requestWithdrawal(payload),
    onSuccess: refresh,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewWithdrawalRequest }) =>
      walletApi.reviewWithdrawal(id, payload),
    onSuccess: refresh,
  });

  return {
    overview,
    pendingWithdrawals,
    topUp: (payload: TopUpWalletRequest) => topUpMutation.mutateAsync(payload),
    requestWithdrawal: (payload: CreateWithdrawalRequest) => withdrawalMutation.mutateAsync(payload),
    reviewWithdrawal: (id: string, payload: ReviewWithdrawalRequest) =>
      reviewMutation.mutateAsync({ id, payload }),
  };
}

