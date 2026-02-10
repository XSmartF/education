import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { todoApi } from '../api/todo-api';
import type { TodoItem } from '../model/types';

const todosKey = ['todos'];

type UseTodosResult = {
  items: TodoItem[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  add: (title: string) => Promise<TodoItem>;
  toggle: (item: TodoItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export function useTodos(): UseTodosResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: todosKey,
    queryFn: () => todoApi.list(),
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => todoApi.create({ title }),
    onSuccess: (created) => {
      queryClient.setQueryData<TodoItem[]>(todosKey, (prev = []) => [created, ...prev]);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (item: TodoItem) => todoApi.update(item.id, { title: item.title, isDone: !item.isDone }),
    onSuccess: (_, item) => {
      queryClient.setQueryData<TodoItem[]>(todosKey, (prev = []) =>
        prev.map((x) => (x.id === item.id ? { ...x, isDone: !x.isDone } : x))
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => todoApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<TodoItem[]>(todosKey, (prev = []) => prev.filter((x) => x.id !== id));
    },
  });

  const errorMessage = query.error instanceof Error ? query.error.message : '';

  return {
    items: query.data ?? [],
    loading: query.isLoading,
    error: errorMessage,
    refresh: () => queryClient.invalidateQueries({ queryKey: todosKey }).then(() => undefined),
    add: (title: string) => addMutation.mutateAsync(title),
    toggle: (item: TodoItem) => toggleMutation.mutateAsync(item),
    remove: (id: string) => removeMutation.mutateAsync(id),
  };
}
