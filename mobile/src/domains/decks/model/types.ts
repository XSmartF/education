export type DeckCard = {
  id: string;
  frontText: string;
  backText: string;
  difficulty: number;
  nextReviewAt?: string | null;
};

export type DeckItem = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  visibility: 'private' | 'public_free' | 'public_paid';
  price: number;
  isPublished: boolean;
  cardCount: number;
  purchaseCount: number;
  ratingAverage: number;
};

export type DeckDetail = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  visibility: 'private' | 'public_free' | 'public_paid';
  price: number;
  isPublished: boolean;
  purchaseCount: number;
  ratingAverage: number;
  cards: DeckCard[];
};

export type CreateDeckRequest = {
  title: string;
  description: string;
  visibility: 'private' | 'public_free' | 'public_paid';
  price: number;
};

export type CreateDeckCardRequest = {
  frontText: string;
  backText: string;
  difficulty: number;
};
