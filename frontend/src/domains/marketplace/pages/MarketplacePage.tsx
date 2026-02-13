import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useMarketplace } from '../hooks/use-marketplace';
import { formatMoney } from '@/shared/utils/format';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageIntro,
  Skeleton,
} from '@/shared/ui';

export default function MarketplacePage() {
  const { t: translate } = useTranslation(['marketplace', 'common']);
  const auth = useAuth();
  const { catalog, purchaseCourse, purchaseDeck } = useMarketplace();

  return (
    <section className="space-y-6">
      <PageIntro title={translate('marketplace:title')} description={translate('marketplace:subtitle')} />

      <Card className="border-primary/10 bg-card/90">
        <CardHeader>
          <CardTitle>{translate('marketplace:catalog')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {catalog.isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <article key={`marketplace-skeleton-${index}`} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-[16rem] flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-xl" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </article>
            ))}
          {catalog.data?.map((item) => (
            <article key={`${item.itemType}-${item.id}`} className="rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="secondary">{item.itemType}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.isFree ? translate('marketplace:free') : formatMoney(item.price)}
                  </p>
                </div>
                {auth.isAuthenticated && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      if (item.itemType === 'course') {
                        await purchaseCourse(item.id);
                      } else {
                        await purchaseDeck(item.id);
                      }
                    }}
                  >
                    {item.isFree ? translate('marketplace:claim') : translate('marketplace:buy')}
                  </Button>
                )}
              </div>
            </article>
          ))}
          {!catalog.isLoading && !catalog.data?.length && (
            <p className="text-sm text-muted-foreground">{translate('marketplace:empty')}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

