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

type ResetSearchState = {
  userId: string;
  token: string;
};

function readResetSearch(): ResetSearchState {
  if (typeof window === 'undefined') {
    return { userId: '', token: '' };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    userId: params.get('userId') ?? '',
    token: params.get('token') ?? '',
  };
}

export default function ResetPasswordPage() {
  const { t: translate } = useTranslation(['auth', 'errors']);
  const navigate = useNavigate();
  const search = useMemo(readResetSearch, []);

  const schema = useMemo(
    () =>
      z
        .object({
          userId: z.string().min(1, translate('auth:resetUserIdRequired')),
          token: z.string().min(1, translate('auth:resetTokenRequired')),
          password: z.string().min(10, translate('auth:passwordMin')),
          confirmPassword: z.string().min(1, translate('auth:confirmPasswordRequired')),
        })
        .refine((values) => values.password === values.confirmPassword, {
          path: ['confirmPassword'],
          message: translate('auth:confirmPasswordMismatch'),
        }),
    [translate]
  );

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      userId: search.userId,
      token: search.token,
      password: '',
      confirmPassword: '',
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      await authApi.resetPassword({
        userId: values.userId,
        token: values.token,
        newPassword: values.password,
      });
      toast({ description: translate('auth:resetPasswordSuccess') });
      navigate({ to: '/login' });
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : translate('errors:generic'),
      });
    }
  });

  return (
    <CCard className="max-w-md">
      <CCardHeader>
        <CCardTitle>{translate('auth:resetPasswordTitle')}</CCardTitle>
      </CCardHeader>
      <CCardContent className="grid gap-4">
        <CForm {...form}>
          <form className="grid gap-4" onSubmit={submit}>
            <CFormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <CFormItem>
                  <CFormLabel>{translate('auth:resetUserId')}</CFormLabel>
                  <CFormControl>
                    <CInput readOnly={Boolean(search.userId)} {...field} />
                  </CFormControl>
                  <CFormMessage />
                </CFormItem>
              )}
            />
            <CFormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <CFormItem>
                  <CFormLabel>{translate('auth:resetToken')}</CFormLabel>
                  <CFormControl>
                    <CInput readOnly={Boolean(search.token)} {...field} />
                  </CFormControl>
                  <CFormMessage />
                </CFormItem>
              )}
            />
            <CFormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <CFormItem>
                  <CFormLabel>{translate('auth:newPassword')}</CFormLabel>
                  <CFormControl>
                    <CInput type="password" autoComplete="new-password" {...field} />
                  </CFormControl>
                  <CFormMessage />
                </CFormItem>
              )}
            />
            <CFormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <CFormItem>
                  <CFormLabel>{translate('auth:confirmPassword')}</CFormLabel>
                  <CFormControl>
                    <CInput type="password" autoComplete="new-password" {...field} />
                  </CFormControl>
                  <CFormMessage />
                </CFormItem>
              )}
            />
            {form.formState.errors.root?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}
            <CButton type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {translate('auth:resetPasswordButton')}
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
