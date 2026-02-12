import { useCallback, useEffect, useState } from 'react';
import { walletApi } from '../api/wallet-api';
import type { WalletOverview, WithdrawalRequestItem } from '../model/types';

type UseWalletResult = {
  overview: WalletOverview | null;
  pending: WithdrawalRequestItem[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  topUp: (amount: number, note?: string) => Promise<void>;
  requestWithdrawal: (amount: number, note?: string) => Promise<void>;
  review: (id: string, approve: boolean, note?: string) => Promise<void>;
};

export function useWallet(isAdmin: boolean): UseWalletResult {
  const [overview, setOverview] = useState<WalletOverview | null>(null);
  const [pending, setPending] = useState<WithdrawalRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [walletOverview, pendingItems] = await Promise.all([
        walletApi.getOverview(),
        isAdmin ? walletApi.listPending() : Promise.resolve([]),
      ]);
      setOverview(walletOverview);
      setPending(pendingItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai vi');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const topUp = async (amount: number, note?: string) => {
    await walletApi.topUp(amount, note);
    await refresh();
  };

  const requestWithdrawal = async (amount: number, note?: string) => {
    await walletApi.requestWithdrawal(amount, note);
    await refresh();
  };

  const review = async (id: string, approve: boolean, note?: string) => {
    await walletApi.review(id, approve, note);
    await refresh();
  };

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { overview, pending, loading, error, refresh, topUp, requestWithdrawal, review };
}
