export const coursesQueryKeys = {
  all: ['courses'] as const,
  catalog: ['courses', 'catalog'] as const,
  mine: ['courses', 'mine'] as const,
  detail: (id: string) => ['courses', 'detail', id] as const,
};

