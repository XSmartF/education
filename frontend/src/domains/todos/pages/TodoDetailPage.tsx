import { useEffect } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { todoApi } from '@/domains/todos/api/todo-api';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import {
  CBadge,
  CButton,
  CCard,
  CCardContent,
  CCardHeader,
  CCardTitle,
  CCheckbox,
  CForm,
  CFormControl,
  CFormField,
  CFormItem,
  CFormLabel,
  CFormMessage,
  CInput,
} from '@/shared/components';

export default function TodoDetailPage() {
  const { t: translate } = useTranslation('todos');
  const auth = useAuth();
  const navigate = useNavigate();
    const { todoId } = useParams({ from: '/dashboard/todos/$todoId' });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['todos', todoId],
    queryFn: () => todoApi.get(todoId),
    enabled: auth.isAuthenticated,
  });

  const todoSchema = z.object({
    title: z.string().trim().min(1, translate('titleRequired')),
    isDone: z.boolean(),
  });

  type TodoFormValues = z.infer<typeof todoSchema>;

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
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todos', todoId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => todoApi.remove(todoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
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
        <CButton asChild variant="ghost">
          <Link to="/todos">{translate('back')}</Link>
        </CButton>
      </div>
    );
  }

  const isDone = form.watch('isDone');
  const submit = form.handleSubmit((values) => updateMutation.mutate(values));

  return (
    <CCard>
      <CCardHeader className="flex flex-row items-center justify-between">
        <CCardTitle>{translate('detailTitle')}</CCardTitle>
        <CBadge variant={isDone ? 'secondary' : 'outline'}>
          {isDone ? translate('statusDone') : translate('statusDoing')}
        </CBadge>
      </CCardHeader>
      <CCardContent className="space-y-4">
        <CForm {...form}>
          <form className="space-y-4" onSubmit={submit}>
            <CFormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <CFormItem>
                  <CFormLabel>{translate('labelTitle')}</CFormLabel>
                  <CFormControl>
                    <CInput {...field} />
                  </CFormControl>
                  <CFormMessage />
                </CFormItem>
              )}
            />
            <CFormField
              control={form.control}
              name="isDone"
              render={({ field }) => (
                <CFormItem className="flex items-center gap-2 space-y-0">
                  <CFormControl>
                    <CCheckbox
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(value === true)}
                    />
                  </CFormControl>
                  <CFormLabel>{translate('labelDone')}</CFormLabel>
                </CFormItem>
              )}
            />
            <div className="flex flex-wrap gap-2">
              <CButton type="submit" disabled={updateMutation.isPending}>
                {translate('save')}
              </CButton>
              <CButton
                type="button"
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {translate('remove')}
              </CButton>
              <CButton asChild variant="ghost" type="button">
                <Link to="/todos">{translate('back')}</Link>
              </CButton>
            </div>
          </form>
        </CForm>
      </CCardContent>
    </CCard>
  );
}
