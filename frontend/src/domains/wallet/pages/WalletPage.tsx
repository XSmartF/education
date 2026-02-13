import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useWallet } from '../hooks/use-wallet';
import { formatDateTime, formatMoney } from '@/shared/utils/format';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  PageIntro,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
  Textarea,
} from '@/shared/ui';

export default function WalletPage() {
  const { t: translate } = useTranslation(['wallet', 'common']);
  const auth = useAuth();
  const { overview, pendingWithdrawals, topUp, requestWithdrawal, reviewWithdrawal } = useWallet(auth.isAdmin);

  const [topUpAmount, setTopUpAmount] = useState('100');
  const [topUpNote, setTopUpNote] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('10');
  const [withdrawNote, setWithdrawNote] = useState('');

  const submitTopUp = async () => {
    const amount = Number.parseFloat(topUpAmount);
    await topUp({ amount: Number.isFinite(amount) ? amount : 0, note: topUpNote.trim() || undefined });
  };

  const submitWithdrawal = async () => {
    const amount = Number.parseFloat(withdrawAmount);
    await requestWithdrawal({
      amount: Number.isFinite(amount) ? amount : 0,
      note: withdrawNote.trim() || undefined,
    });
  };

  return (
    <section className="space-y-6">
      <PageIntro title={translate('wallet:title')} description={translate('wallet:subtitle')} />

      <Card className="border-primary/10 bg-card/90">
        <CardHeader>
          <CardTitle>{translate('wallet:balance')}</CardTitle>
        </CardHeader>
        <CardContent>
          {overview.isLoading ? (
            <Skeleton className="h-10 w-48" />
          ) : (
            <p className="text-3xl font-semibold">{formatMoney(overview.data?.balance ?? 0)}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('wallet:topUp')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="wallet-topup-amount">{translate('wallet:amount')}</Label>
              <Input
                id="wallet-topup-amount"
                value={topUpAmount}
                onChange={(event) => setTopUpAmount(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wallet-topup-note">{translate('wallet:note')}</Label>
              <Textarea
                id="wallet-topup-note"
                value={topUpNote}
                onChange={(event) => setTopUpNote(event.target.value)}
              />
            </div>
            <Button onClick={() => void submitTopUp()}>{translate('wallet:topUp')}</Button>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('wallet:requestWithdrawal')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="wallet-withdraw-amount">{translate('wallet:amount')}</Label>
              <Input
                id="wallet-withdraw-amount"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wallet-withdraw-note">{translate('wallet:note')}</Label>
              <Textarea
                id="wallet-withdraw-note"
                value={withdrawNote}
                onChange={(event) => setWithdrawNote(event.target.value)}
              />
            </div>
            <Button onClick={() => void submitWithdrawal()}>{translate('wallet:requestWithdrawal')}</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 bg-card/90">
        <CardHeader>
          <CardTitle>{translate('wallet:transactions')}</CardTitle>
        </CardHeader>
        <CardContent>
          {overview.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={`wallet-tx-skeleton-${index}`} className="grid gap-3 sm:grid-cols-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{translate('wallet:type')}</TableHead>
                  <TableHead>{translate('wallet:amount')}</TableHead>
                  <TableHead>{translate('wallet:description')}</TableHead>
                  <TableHead>{translate('wallet:time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overview.data?.transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell>{formatMoney(tx.amount)}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell>{formatDateTime(tx.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {auth.isAdmin && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('wallet:pendingWithdrawals')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingWithdrawals.isLoading &&
              Array.from({ length: 2 }).map((_, index) => (
                <article key={`withdrawal-skeleton-${index}`} className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-[16rem] flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-52" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                  </div>
                </article>
              ))}
            {pendingWithdrawals.data?.map((item) => (
              <article key={item.id} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 text-sm">
                    <p>{translate('wallet:userId')}: {item.userId}</p>
                    <p>{translate('wallet:amount')}: {formatMoney(item.amount)}</p>
                    <p>{translate('wallet:status')}: {item.status}</p>
                    <p>{translate('wallet:time')}: {formatDateTime(item.createdAt)}</p>
                    {item.note && <p>{translate('wallet:note')}: {item.note}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => void reviewWithdrawal(item.id, { approve: true })}
                    >
                      {translate('wallet:approve')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void reviewWithdrawal(item.id, { approve: false })}
                    >
                      {translate('wallet:reject')}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {!pendingWithdrawals.isLoading && !pendingWithdrawals.data?.length && (
              <p className="text-sm text-muted-foreground">{translate('wallet:noPending')}</p>
            )}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

