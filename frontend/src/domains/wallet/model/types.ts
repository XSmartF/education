export type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt: string;
};

export type WalletOverview = {
  userId: string;
  balance: number;
  transactions: WalletTransaction[];
};

export type TopUpWalletRequest = {
  amount: number;
  note?: string;
};

export type CreateWithdrawalRequest = {
  amount: number;
  note?: string;
};

export type ReviewWithdrawalRequest = {
  approve: boolean;
  note?: string;
};

export type WithdrawalRequestItem = {
  id: string;
  userId: string;
  amount: number;
  status: string;
  note?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
};

