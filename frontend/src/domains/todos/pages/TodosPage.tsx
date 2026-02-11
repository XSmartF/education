import { TodoList } from '@/domains/todos/ui/TodoList';
import { useAuth } from '@/domains/auth/hooks/use-auth';

export default function TodosPage() {
  const auth = useAuth();

  return <TodoList canEdit={auth.isAuthenticated} />;
}
