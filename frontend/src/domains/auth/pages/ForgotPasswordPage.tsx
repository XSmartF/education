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

export default function ForgotPasswordPage() {
  const { t: translate } = useTranslation(['auth', 'errors']);
  const navigate = useNavigate();
  type FormValues = { email: string };

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
    <Card className="w-full max-w-md overflow-hidden border-border/75">
      <div className="pointer-events-none h-1.5 bg-primary/65" />
      <CardHeader>
        <CardTitle className="text-2xl">{translate('auth:forgotPasswordTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form className="grid gap-4" onSubmit={submit}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translate('auth:email')}</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root?.message && (
              <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {translate('auth:forgotPasswordButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button variant="ghost" className="w-full" onClick={() => navigate({ to: '/login' })}>
          {translate('auth:backToLogin')}
        </Button>
      </CardFooter>
    </Card>
  );
}

