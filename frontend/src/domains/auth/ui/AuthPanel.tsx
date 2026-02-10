import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authApi } from '../api/auth-api';
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

type AuthMode = 'login' | 'register';

type Props = {
  onAuth: () => void;
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
};

export function AuthPanel({ onAuth, mode, onModeChange }: Props) {
  const { t: translate } = useTranslation(['auth', 'errors']);
  const [internalMode, setInternalMode] = useState<AuthMode>(mode ?? 'login');
  const activeMode = mode ?? internalMode;

  const authSchema = useMemo(
    () =>
      z.discriminatedUnion('mode', [
        z.object({
          mode: z.literal('login'),
          email: z
            .string()
            .min(1, translate('auth:emailRequired'))
            .email(translate('auth:emailInvalid')),
          password: z.string().min(10, translate('auth:passwordMin')),
          displayName: z.string().optional(),
        }),
        z.object({
          mode: z.literal('register'),
          email: z
            .string()
            .min(1, translate('auth:emailRequired'))
            .email(translate('auth:emailInvalid')),
          password: z.string().min(10, translate('auth:passwordMin')),
          displayName: z.string().min(2, translate('auth:displayNameMin')),
        }),
      ]),
    [translate]
  );

  type AuthFormValues = z.infer<typeof authSchema>;

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: activeMode,
      email: '',
      password: '',
      displayName: '',
    },
  });

  useEffect(() => {
    form.setValue('mode', activeMode);
    if (activeMode === 'login') {
      form.setValue('displayName', '');
    }
    form.clearErrors();
  }, [activeMode, form]);

  const setMode = (next: AuthMode) => {
    if (onModeChange) {
      onModeChange(next);
    } else {
      setInternalMode(next);
    }
    form.reset({ mode: next, email: '', password: '', displayName: '' });
  };

  const submit = form.handleSubmit(async (values) => {
    form.clearErrors();
    try {
      if (values.mode === 'register') {
        await authApi.register({
          email: values.email,
          password: values.password,
          displayName: values.displayName,
        });
      } else {
        await authApi.login({ email: values.email, password: values.password });
      }
      onAuth();
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : translate('errors:generic'),
      });
    }
  });

  const submitLabel =
    activeMode === 'login' ? translate('auth:loginButton') : translate('auth:registerButton');
  const passwordAutoComplete = activeMode === 'register' ? 'new-password' : 'current-password';

  return (
    <CCard className="max-w-md">
      <CCardHeader>
        <CCardTitle>
          {activeMode === 'login'
            ? translate('auth:loginTitle')
            : translate('auth:registerTitle')}
        </CCardTitle>
      </CCardHeader>
      <CCardContent className="grid gap-4">
        <CForm {...form}>
          <form className="grid gap-4" onSubmit={submit}>
            <input type="hidden" {...form.register('mode')} />
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
            {activeMode === 'register' && (
              <CFormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <CFormItem>
                    <CFormLabel>{translate('auth:displayName')}</CFormLabel>
                    <CFormControl>
                      <CInput autoComplete="name" {...field} />
                    </CFormControl>
                    <CFormMessage />
                  </CFormItem>
                )}
              />
            )}
            <CFormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <CFormItem>
                  <CFormLabel>{translate('auth:password')}</CFormLabel>
                  <CFormControl>
                    <CInput type="password" autoComplete={passwordAutoComplete} {...field} />
                  </CFormControl>
                  <CFormMessage />
                </CFormItem>
              )}
            />
            {form.formState.errors.root?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}
            <CButton type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {submitLabel}
            </CButton>
          </form>
        </CForm>
      </CCardContent>
      <CCardFooter className="flex flex-col gap-2">
        <CButton
          variant="ghost"
          className="w-full"
          onClick={() => setMode(activeMode === 'login' ? 'register' : 'login')}
        >
          {activeMode === 'login'
            ? translate('auth:switchToRegister')
            : translate('auth:switchToLogin')}
        </CButton>
      </CCardFooter>
    </CCard>
  );
}
