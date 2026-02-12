export const decksQueryKeys = {
  all: ['decks'] as const,
  published: ['decks', 'published'] as const,
  mine: ['decks', 'mine'] as const,
  detail: (id: string) => ['decks', 'detail', id] as const,
};

