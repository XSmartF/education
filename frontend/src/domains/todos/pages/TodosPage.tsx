import { TodoList } from '@/domains/todos/ui/TodoList';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import { PageIntro } from '@/shared/ui';

export default function TodosPage() {
  const auth = useAuth();
  const { t: translate } = useTranslation('todos');

  return (
    <section className="space-y-4">
      <PageIntro title={translate('title')} description={translate('subtitle')} />
      <TodoList canEdit={auth.isAuthenticated} />
    </section>
  );
}
