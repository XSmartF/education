import { api } from '@/shared/api/http-client';
import type { CreateTodoRequest, PatchTodoRequest, TodoItem, UpdateTodoRequest } from '../model/types';

export const todoApi = {
  list: () => api.get<TodoItem[]>('/todos'),
  get: (id: string) => api.get<TodoItem>(`/todos/${id}`),
  create: (payload: CreateTodoRequest) => api.post<TodoItem>('/todos', payload),
  update: (id: string, payload: UpdateTodoRequest) => api.put<void>(`/todos/${id}`, payload),
  patch: (id: string, payload: PatchTodoRequest) => api.patch<void>(`/todos/${id}`, payload),
  remove: (id: string) => api.delete<void>(`/todos/${id}`),
};
