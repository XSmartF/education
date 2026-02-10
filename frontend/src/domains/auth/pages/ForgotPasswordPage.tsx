import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { authApi } from '@/domains/auth/api/auth-api';
import {
  CButton,
  CCard,
  CCardContent,
  CCardFooter,
  CCardHeader,
  CCardTitle,
  CForm,
  CFormControl,
  CFormField,
  CFormItem,
  CFormLabel,
  CFormMessage,
  CInput,
} from '@/shared/components';
import { toast } from '@/shared/hooks/use-toast';

export default function ForgotPasswordPage() {
  const { t: translate } = useTranslation(['auth', 'errors']);
  const navigate = useNavigate();

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, translate('auth:emailRequired'))
          .email(translate('auth:emailInvalid')),
      }),
    [translate]
  );

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await authApi.forgotPassword({ email: values.email, client: 'web' });
      toast({ description: translate('auth:forgotPasswordSuccess') });
      form.reset({ email: '' });
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : translate('errors:generic'),
      });
    }
  });

  return (
    <CCard className="max-w-md">
      <CCardHeader>
        <CCardTitle>{translate('auth:forgotPasswordTitle')}</CCardTitle>
      </CCardHeader>
      <CCardContent className="grid gap-4">
        <CForm {...form}>
          <form className="grid gap-4" onSubmit={submit}>
            <CFormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <CFormItem>
                  <CFormLabel>{translate('auth:email')}</CFormLabel>
                  <CFormControl>
                    <CInput type="email" autoComplete="email" {...field} />
                  </CFormControl>
                  <CFormMessage />
                </CFormItem>
              )}
            />
            {form.formState.errors.root?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}
            <CButton type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {translate('auth:forgotPasswordButton')}
            </CButton>
          </form>
        </CForm>
      </CCardContent>
      <CCardFooter className="flex flex-col gap-2">
        <CButton variant="link" className="w-full" onClick={() => navigate({ to: '/login' })}>
          {translate('auth:backToLogin')}
        </CButton>
      </CCardFooter>
    </CCard>
  );
}
