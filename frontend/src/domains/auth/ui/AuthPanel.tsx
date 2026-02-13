import { useEffect, useMemo, useState } from 'react';
import { Lock, Mail, Sparkles, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { authApi } from '../api/auth-api';
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { cn } from '@/shared/utils';

type AuthMode = 'login' | 'register';
type UserRole = 'Student' | 'Teacher' | 'Organize';
type AuthFormValues = {
  mode: AuthMode;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
};

type Props = {
  onAuth: () => void;
  mode?: AuthMode;
  onModeChange?: (mode: AuthMode) => void;
};

const createAuthSchema = (translate: (key: string) => string) =>
  z.discriminatedUnion('mode', [
    z.object({
      mode: z.literal('login'),
      email: z.string().min(1, translate('emailRequired')).email(translate('emailInvalid')),
      password: z.string().min(10, translate('passwordMin')),
      displayName: z.string().optional(),
      role: z.enum(['Student', 'Teacher', 'Organize']),
    }),
    z.object({
      mode: z.literal('register'),
      email: z.string().min(1, translate('emailRequired')).email(translate('emailInvalid')),
      password: z.string().min(10, translate('passwordMin')),
      displayName: z.string().min(2, translate('displayNameMin')),
      role: z.enum(['Student', 'Teacher', 'Organize']),
    }),
  ]);

export function AuthPanel({ onAuth, mode, onModeChange }: Props) {
  const { t: translate } = useTranslation(['auth', 'errors']);
  const [internalMode, setInternalMode] = useState<AuthMode>(mode ?? 'login');
  const activeMode = mode ?? internalMode;

  const authSchema = useMemo(() => createAuthSchema(translate), [translate]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      mode: activeMode,
      email: '',
      password: '',
      displayName: '',
      role: 'Student',
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
    form.reset({ mode: next, email: '', password: '', displayName: '', role: 'Student' });
  };

  const submit = form.handleSubmit(async (values) => {
    form.clearErrors();
    try {
      if (values.mode === 'register') {
        await authApi.register({
          email: values.email,
          password: values.password,
          displayName: values.displayName,
          role: values.role,
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

  const submitLabel = activeMode === 'login' ? translate('loginButton') : translate('registerButton');
  const passwordAutoComplete = activeMode === 'register' ? 'new-password' : 'current-password';
  const title = activeMode === 'login' ? translate('loginTitle') : translate('registerTitle');
  const description =
    activeMode === 'login' ? translate('loginDescription') : translate('registerDescription');
  const switchLabel = activeMode === 'login' ? translate('switchToRegister') : translate('switchToLogin');

  return (
    <div className="edu-panel mx-auto w-full max-w-md p-5 sm:p-6">
      <div className="space-y-2">
        <span className="edu-chip border-primary/15 bg-primary/10 text-primary">
          <Sparkles className="size-3.5" />
          {translate('welcomeLabel')}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 rounded-lg border border-border/90 bg-muted/40 p-1">
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-10 rounded-md',
            activeMode === 'login' && 'bg-background text-foreground shadow-sm hover:bg-background'
          )}
          onClick={() => setMode('login')}
        >
          {translate('loginTitle')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'h-10 rounded-md',
            activeMode === 'register' && 'bg-background text-foreground shadow-sm hover:bg-background'
          )}
          onClick={() => setMode('register')}
        >
          {translate('registerTitle')}
        </Button>
      </div>

      <Form {...form}>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <input type="hidden" {...form.register('mode')} />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>{translate('email')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="email" autoComplete="email" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {activeMode === 'register' && (
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{translate('displayName')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input autoComplete="name" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {activeMode === 'register' && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{translate('roleLabel')}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Student">{translate('roleStudent')}</SelectItem>
                        <SelectItem value="Teacher">{translate('roleTeacher')}</SelectItem>
                        <SelectItem value="Organize">{translate('roleOrganize')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>{translate('password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      autoComplete={passwordAutoComplete}
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root?.message && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <Button type="submit" className="h-11 w-full rounded-md" disabled={form.formState.isSubmitting}>
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="link"
            className="h-auto w-full px-0 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(activeMode === 'login' ? 'register' : 'login')}
          >
            {switchLabel}
          </Button>
        </form>
      </Form>
    </div>
  );
}
