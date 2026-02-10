import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTodos } from '../hooks/use-todos';
import {
  CBadge,
  CButton,
  CCard,
  CCardContent,
  CCardHeader,
  CCardTitle,
  CForm,
  CFormControl,
  CFormField,
  CFormItem,
  CFormMessage,
  CInput,
} from '@/shared/components';

type Props = {
  canEdit: boolean;
};

export function TodoList({ canEdit }: Props) {
  const { t: translate } = useTranslation('todos');
  const { items, loading, error, add, toggle, remove } = useTodos();

  const todoSchema = z.object({
    title: z.string().trim().min(1, translate('titleRequired')),
  });

  type TodoFormValues = z.infer<typeof todoSchema>;

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
    <CCard>
      <CCardHeader className="flex flex-row items-center justify-between">
        <CCardTitle>{translate('title')}</CCardTitle>
        {!canEdit && <CBadge variant="secondary">{translate('readOnly')}</CBadge>}
      </CCardHeader>
      <CCardContent className="space-y-4">
        <CForm {...form}>
          <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <CFormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <CFormItem className="w-full">
                  <CFormControl>
                    <CInput
                      placeholder={translate('addPlaceholder')}
                      disabled={!canEdit}
                      {...field}
                    />
                  </CFormControl>
                  <CFormMessage />
                </CFormItem>
              )}
            />
            <CButton type="submit" disabled={!canEdit || form.formState.isSubmitting}>
              {translate('addButton')}
            </CButton>
          </form>
        </CForm>

        {loading && <p className="text-sm text-muted-foreground">{translate('loading')}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <CButton
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
              </CButton>
              <div className="flex flex-wrap items-center gap-2">
                <CButton asChild variant="ghost" size="sm">
                  <Link to="/todos/$todoId" params={{ todoId: item.id }}>
                    {translate('detail')}
                  </Link>
                </CButton>
                {canEdit && (
                  <CButton variant="destructive" size="sm" onClick={() => remove(item.id)}>
                    {translate('remove')}
                  </CButton>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CCardContent>
    </CCard>
  );
}
