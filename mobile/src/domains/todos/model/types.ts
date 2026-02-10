export type TodoItem = {
  id: string;
  title: string;
  isDone: boolean;
  createdAt: string;
};

export type CreateTodoRequest = {
  title: string;
};

export type UpdateTodoRequest = {
  title: string;
  isDone: boolean;
};

export type PatchTodoRequest = {
  title?: string;
  isDone?: boolean;
};
