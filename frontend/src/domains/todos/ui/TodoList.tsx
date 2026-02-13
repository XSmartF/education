import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTodos } from '../hooks/use-todos';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Skeleton,
} from '@/shared/ui';

type Props = {
  canEdit: boolean;
};

export function TodoList({ canEdit }: Props) {
  const { t: translate } = useTranslation('todos');
  const { items, loading, error, add, toggle, remove } = useTodos();
  type TodoFormValues = { title: string };

  const todoSchema = z.object({
    title: z.string().trim().min(1, translate('titleRequired')),
  });

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
    },
  });

  const submit = form.handleSubmit(async (values) => {
    if (!canEdit) {
      return;
    }
    await add(values.title);
    form.reset({ title: '' });
  });

  return (
    <Card className="border-primary/10 bg-card/90">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{translate('title')}</CardTitle>
        {!canEdit && <Badge variant="secondary">{translate('readOnly')}</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder={translate('addPlaceholder')}
                      disabled={!canEdit}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!canEdit || form.formState.isSubmitting}>
              {translate('addButton')}
            </Button>
          </form>
        </Form>

        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`todo-skeleton-${index}`} className="rounded-lg border bg-muted/20 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-5 w-full max-w-sm" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !items.length && <p className="text-sm text-muted-foreground">{translate('empty')}</p>}

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <Button
                type="button"
                variant="ghost"
                disabled={!canEdit}
                className={
                  item.isDone
                    ? 'h-auto justify-start p-0 text-sm text-muted-foreground line-through'
                    : 'h-auto justify-start p-0 text-sm font-medium'
                }
                onClick={() => canEdit && toggle(item)}
              >
                {item.title}
              </Button>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/todos/$todoId" params={{ todoId: item.id }}>
                    {translate('detail')}
                  </Link>
                </Button>
                {canEdit && (
                  <Button variant="destructive" size="sm" onClick={() => remove(item.id)}>
                    {translate('remove')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

