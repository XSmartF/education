export type MarketplaceCatalogItem = {
  id: string;
  itemType: 'course' | 'deck';
  sellerId: string;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
};

export type PurchaseItemResult = {
  itemType: string;
  itemId: string;
  amount: number;
  commissionAmount: number;
  sellerPayout: number;
  balanceAfter: number;
  status: string;
};
