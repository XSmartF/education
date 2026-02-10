import { useEffect, useState } from 'react';
import { todoApi } from '../api/todo-api';
import type { TodoItem } from '../model/types';

type UseTodosResult = {
  items: TodoItem[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  add: (title: string) => Promise<void>;
  toggle: (item: TodoItem) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export function useTodos(): UseTodosResult {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await todoApi.list();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai du lieu');
    } finally {
      setLoading(false);
    }
  };

  const add = async (title: string) => {
    const created = await todoApi.create({ title });
    setItems((prev) => [created, ...prev]);
  };

  const toggle = async (item: TodoItem) => {
    await todoApi.update(item.id, { title: item.title, isDone: !item.isDone });
    setItems((prev) => prev.map((x) => (x.id === item.id ? { ...x, isDone: !x.isDone } : x)));
  };

  const remove = async (id: string) => {
    await todoApi.remove(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  useEffect(() => {
    refresh();
  }, []);

  return { items, loading, error, refresh, add, toggle, remove };
}
