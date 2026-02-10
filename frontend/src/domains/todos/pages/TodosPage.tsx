import { Navigate } from '@tanstack/react-router';
import { TodoList } from '@/domains/todos/ui/TodoList';
import { useAuth } from '@/domains/auth/hooks/use-auth';

export default function TodosPage() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <TodoList canEdit={auth.isAuthenticated} />;
}
