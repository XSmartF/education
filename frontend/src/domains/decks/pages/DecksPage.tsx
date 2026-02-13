import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useDeckCatalog } from '../hooks/use-decks';
import { formatMoney } from '@/shared/utils/format';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  PageIntro,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Textarea,
} from '@/shared/ui';
import type { CreateDeckRequest } from '../model/types';

export default function DecksPage() {
  const { t: translate } = useTranslation(['decks', 'common']);
  const auth = useAuth();
  const { published, mine, createDeck, publishDeck } = useDeckCatalog(auth.isAuthenticated);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<CreateDeckRequest['visibility']>('public_free');
  const [price, setPrice] = useState('0');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const submit = async () => {
    const parsedPrice = Number.parseFloat(price);
    await createDeck({
      title: title.trim(),
      description: description.trim(),
      visibility,
      price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    });

    setTitle('');
    setDescription('');
    setVisibility('public_free');
    setPrice('0');
    setIsCreateDialogOpen(false);
  };

  return (
    <section className="space-y-6">
      <PageIntro title={translate('decks:title')} description={translate('decks:subtitle')} />

      {auth.isAuthenticated && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle>{translate('decks:createDeck')}</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>{translate('decks:createDeck')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{translate('decks:createDeck')}</DialogTitle>
                  <DialogDescription>{translate('decks:subtitle')}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="deck-title">{translate('decks:deckTitle')}</Label>
                    <Input id="deck-title" value={title} onChange={(event) => setTitle(event.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deck-description">{translate('decks:deckDescription')}</Label>
                    <Textarea
                      id="deck-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>{translate('decks:visibility')}</Label>
                      <Select value={visibility} onValueChange={(value) => setVisibility(value as CreateDeckRequest['visibility'])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">{translate('decks:visibilityPrivate')}</SelectItem>
                          <SelectItem value="public_free">{translate('decks:visibilityFree')}</SelectItem>
                          <SelectItem value="public_paid">{translate('decks:visibilityPaid')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deck-price">{translate('decks:price')}</Label>
                      <Input id="deck-price" value={price} onChange={(event) => setPrice(event.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => void submit()} disabled={!title.trim() || !description.trim()}>
                    {translate('decks:createDeck')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{translate('decks:subtitle')}</p>
          </CardContent>
        </Card>
      )}

      {auth.isAuthenticated && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('decks:myDecks')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mine.isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <DeckListItemSkeleton key={`mine-deck-skeleton-${index}`} />
              ))}
            {mine.data?.map((deck) => (
              <article key={deck.id} className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p className="font-medium">{deck.title}</p>
                    <p className="text-sm text-muted-foreground">{deck.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {deck.visibility} • {formatMoney(deck.price)} • {translate('decks:cards')}: {deck.cardCount}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!deck.isPublished && (
                      <Button size="sm" onClick={() => void publishDeck(deck.id)}>
                        {translate('decks:publish')}
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <Link to="/decks/$deckId" params={{ deckId: deck.id }}>
                        {translate('decks:manage')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {!mine.isLoading && !mine.data?.length && (
              <p className="text-sm text-muted-foreground">{translate('decks:noDecks')}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10 bg-card/90">
        <CardHeader>
          <CardTitle>{translate('decks:publishedDecks')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {published.isLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <DeckListItemSkeleton key={`published-deck-skeleton-${index}`} />
            ))}
          {published.data?.map((deck) => (
            <article key={deck.id} className="rounded-lg border bg-muted/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-medium">{deck.title}</p>
                  <p className="text-sm text-muted-foreground">{deck.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span>{deck.visibility}</span>
                    <span>{formatMoney(deck.price)}</span>
                    <span>{translate('decks:cards')}: {deck.cardCount}</span>
                    <span>{translate('decks:purchases')}: {deck.purchaseCount}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {deck.isPublished ? (
                    <Badge>{translate('decks:published')}</Badge>
                  ) : (
                    <Badge variant="secondary">{translate('decks:draft')}</Badge>
                  )}
                  <Button asChild variant="outline" size="sm">
                    <Link to="/decks/$deckId" params={{ deckId: deck.id }}>
                      {translate('decks:details')}
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {!published.isLoading && !published.data?.length && (
            <p className="text-sm text-muted-foreground">{translate('decks:noPublished')}</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function DeckListItemSkeleton() {
  return (
    <article className="rounded-lg border bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-[16rem] flex-1 space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-full max-w-xl" />
          <Skeleton className="h-3 w-64" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </article>
  );
}

