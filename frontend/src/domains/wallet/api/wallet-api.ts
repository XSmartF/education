import { api } from '@/shared/api/http-client';
import type {
  CreateWithdrawalRequest,
  ReviewWithdrawalRequest,
  TopUpWalletRequest,
  WalletOverview,
  WithdrawalRequestItem,
} from '../model/types';

export const walletApi = {
  getOverview: () => api.get<WalletOverview>('/wallet'),
  topUp: (payload: TopUpWalletRequest) => api.post<WalletOverview>('/wallet/top-up', payload),
  requestWithdrawal: (payload: CreateWithdrawalRequest) =>
    api.post<WithdrawalRequestItem>('/wallet/withdrawals', payload),
  listPendingWithdrawals: () =>
    api.get<WithdrawalRequestItem[]>('/wallet/withdrawals/pending'),
  reviewWithdrawal: (id: string, payload: ReviewWithdrawalRequest) =>
    api.post<WithdrawalRequestItem>(`/wallet/withdrawals/${id}/review`, payload),
};

