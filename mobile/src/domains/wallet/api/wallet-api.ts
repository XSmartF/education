import { api } from '@/shared/api/http-client';
import type { WalletOverview, WithdrawalRequestItem } from '../model/types';

export const walletApi = {
  getOverview: () => api.get<WalletOverview>('/wallet'),
  topUp: (amount: number, note?: string) => api.post<WalletOverview>('/wallet/top-up', { amount, note }),
  requestWithdrawal: (amount: number, note?: string) =>
    api.post<WithdrawalRequestItem>('/wallet/withdrawals', { amount, note }),
  listPending: () => api.get<WithdrawalRequestItem[]>('/wallet/withdrawals/pending'),
  review: (id: string, approve: boolean, note?: string) =>
    api.post<WithdrawalRequestItem>(`/wallet/withdrawals/${id}/review`, { approve, note }),
};
