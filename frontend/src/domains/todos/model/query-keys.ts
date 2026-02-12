export const todosQueryKeys = {
  all: ['todos'] as const,
  detail: (todoId: string) => ['todos', todoId] as const,
};
