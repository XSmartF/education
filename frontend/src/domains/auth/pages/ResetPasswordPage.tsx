import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { authApi } from '@/domains/auth/api/auth-api';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/shared/ui';
import { toast } from '@/shared/hooks/use-toast';

type ResetSearchState = {
  userId: string;
  token: string;
};

function readResetSearch(): ResetSearchState {
  if (!('window' in globalThis)) {
    return { userId: '', token: '' };
  }

  const params = new URLSearchParams(globalThis.window.location.search);
  return {
    userId: params.get('userId') ?? '',
    token: params.get('token') ?? '',
  };
}

export default function ResetPasswordPage() {
  const { t: translate } = useTranslation(['auth', 'errors']);
  const navigate = useNavigate();
  const search = useMemo(readResetSearch, []);
  type FormValues = {
    userId: string;
    token: string;
    password: string;
    confirmPassword: string;
  };

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
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>{translate('auth:resetPasswordTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form className="grid gap-4" onSubmit={submit}>
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate('auth:resetUserId')}</FormLabel>
                  <FormControl>
                    <Input readOnly={Boolean(search.userId)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate('auth:resetToken')}</FormLabel>
                  <FormControl>
                    <Input readOnly={Boolean(search.token)} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate('auth:newPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate('auth:confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {translate('auth:resetPasswordButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button variant="link" className="w-full" onClick={() => navigate({ to: '/login' })}>
          {translate('auth:backToLogin')}
        </Button>
      </CardFooter>
    </Card>
  );
}

