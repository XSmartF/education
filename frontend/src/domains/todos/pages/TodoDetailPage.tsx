import { useEffect } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { todoApi } from '@/domains/todos/api/todo-api';
import { todosQueryKeys } from '@/domains/todos/model/query-keys';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  PageIntro,
} from '@/shared/ui';

export default function TodoDetailPage() {
  const { t: translate } = useTranslation('todos');
  const auth = useAuth();
  const navigate = useNavigate();
  const { todoId } = useParams({ from: '/dashboard/todos/$todoId' });
  const queryClient = useQueryClient();
  type TodoFormValues = {
    title: string;
    isDone: boolean;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: todosQueryKeys.detail(todoId),
    queryFn: () => todoApi.get(todoId),
    enabled: auth.isAuthenticated,
  });

  const todoSchema = z.object({
    title: z.string().trim().min(1, translate('titleRequired')),
    isDone: z.boolean(),
  });

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: '',
      isDone: false,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({ title: data.title, isDone: data.isDone });
    }
  }, [data, form]);

  const updateMutation = useMutation({
    mutationFn: (values: TodoFormValues) => todoApi.update(todoId, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.detail(todoId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => todoApi.remove(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todosQueryKeys.all });
      navigate({ to: '/todos' });
    },
  });

  // access control handled by router/RequireAuth wrapper

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{translate('loading')}</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{translate('notFound')}</p>
        <Button asChild variant="ghost">
          <Link to="/todos">{translate('back')}</Link>
        </Button>
      </div>
    );
  }

  const isDone = form.watch('isDone');
  const submit = form.handleSubmit((values) => updateMutation.mutate(values));

  return (
    <section className="space-y-4">
      <PageIntro
        title={translate('detailTitle')}
        description={translate('detailSubtitle')}
        actions={
          <Button asChild variant="ghost" type="button">
            <Link to="/todos">{translate('back')}</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{translate('labelTitle')}</CardTitle>
          <Badge variant={isDone ? 'secondary' : 'outline'}>
            {isDone ? translate('statusDone') : translate('statusDoing')}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form className="space-y-4" onSubmit={submit}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translate('labelTitle')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isDone"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(value) => field.onChange(value === true)}
                      />
                    </FormControl>
                    <FormLabel>{translate('labelDone')}</FormLabel>
                  </FormItem>
                )}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={updateMutation.isPending}>
                  {translate('save')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {translate('remove')}
                </Button>
                <Button asChild variant="ghost" type="button">
                  <Link to="/todos">{translate('back')}</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}

