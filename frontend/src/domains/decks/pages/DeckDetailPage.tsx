import { useEffect, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import { useDeckDetail } from '../hooks/use-decks';
import { formatDateTime, formatMoney } from '@/shared/utils/format';
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
import type { UpdateDeckRequest } from '../model/types';

export default function DeckDetailPage() {
  const { deckId } = useParams({ from: '/decks/$deckId' });
  const { t: translate } = useTranslation(['decks', 'common']);
  const auth = useAuth();
  const { detail, updateDeck, addCard, publishDeck } = useDeckDetail(deckId);

  const deck = detail.data;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<UpdateDeckRequest['visibility']>('public_free');
  const [price, setPrice] = useState('0');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isAddCardDialogOpen, setIsAddCardDialogOpen] = useState(false);

  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [difficulty, setDifficulty] = useState('1');

  useEffect(() => {
    if (!deck) {
      return;
    }

    setTitle(deck.title);
    setDescription(deck.description);
    setVisibility(deck.visibility);
    setPrice(String(deck.price));
  }, [deck]);

  const submitUpdate = async () => {
    if (!deck) {
      return;
    }

    const parsedPrice = Number.parseFloat(price);
    await updateDeck({
      title: title.trim(),
      description: description.trim(),
      visibility,
      price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    });
    setIsUpdateDialogOpen(false);
  };

  const submitCard = async () => {
    const parsedDifficulty = Number.parseInt(difficulty, 10);
    await addCard({
      frontText: frontText.trim(),
      backText: backText.trim(),
      difficulty: Number.isFinite(parsedDifficulty) ? parsedDifficulty : 1,
    });
    setFrontText('');
    setBackText('');
    setDifficulty('1');
    setIsAddCardDialogOpen(false);
  };

  if (detail.isLoading) {
    return (
      <section className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Card className="border-primary/10 bg-card/90">
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-2xl" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-9 w-28" />
          </CardContent>
        </Card>
        <Card className="border-primary/10 bg-card/90">
          <CardContent className="space-y-3 p-6">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!deck) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{translate('decks:notFound')}</p>
          <Button asChild className="mt-4" variant="outline">
            <Link to="/decks">{translate('decks:backToDecks')}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      <PageIntro title={deck.title} description={deck.description} />

      <Card className="border-primary/10 bg-card/90">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{translate('decks:overview')}</CardTitle>
          {deck.isPublished ? (
            <Badge>{translate('decks:published')}</Badge>
          ) : (
            <Badge variant="secondary">{translate('decks:draft')}</Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {deck.visibility} • {formatMoney(deck.price)} • {translate('decks:purchases')}: {deck.purchaseCount}
          </p>
          {auth.isAuthenticated && !deck.isPublished && (
            <Button onClick={() => void publishDeck()}>{translate('decks:publish')}</Button>
          )}
        </CardContent>
      </Card>

      {auth.isAuthenticated && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('decks:manage')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">{translate('decks:updateDeck')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{translate('decks:updateDeck')}</DialogTitle>
                    <DialogDescription>{deck.title}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="deck-update-title">{translate('decks:deckTitle')}</Label>
                      <Input
                        id="deck-update-title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="deck-update-description">{translate('decks:deckDescription')}</Label>
                      <Textarea
                        id="deck-update-description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>{translate('decks:visibility')}</Label>
                        <Select value={visibility} onValueChange={(value) => setVisibility(value as UpdateDeckRequest['visibility'])}>
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
                        <Label htmlFor="deck-update-price">{translate('decks:price')}</Label>
                        <Input
                          id="deck-update-price"
                          value={price}
                          onChange={(event) => setPrice(event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => void submitUpdate()}>{translate('decks:saveChanges')}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isAddCardDialogOpen} onOpenChange={setIsAddCardDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">{translate('decks:addCard')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{translate('decks:addCard')}</DialogTitle>
                    <DialogDescription>{deck.title}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="card-front">{translate('decks:frontText')}</Label>
                      <Textarea id="card-front" value={frontText} onChange={(event) => setFrontText(event.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="card-back">{translate('decks:backText')}</Label>
                      <Textarea id="card-back" value={backText} onChange={(event) => setBackText(event.target.value)} />
                    </div>
                    <div className="grid gap-2 sm:max-w-xs">
                      <Label htmlFor="card-difficulty">{translate('decks:difficulty')}</Label>
                      <Input id="card-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => void submitCard()} disabled={!frontText.trim() || !backText.trim()}>
                      {translate('decks:addCard')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10 bg-card/90">
        <CardHeader>
          <CardTitle>{translate('decks:cardsList')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deck.cards.map((card) => (
            <article key={card.id} className="rounded-lg border bg-muted/20 p-4">
              <p className="text-sm font-medium">{card.frontText}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.backText}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {translate('decks:difficulty')}: {card.difficulty}
                {card.nextReviewAt ? ` • ${translate('decks:nextReview')}: ${formatDateTime(card.nextReviewAt)}` : ''}
              </p>
            </article>
          ))}
          {!deck.cards.length && <p className="text-sm text-muted-foreground">{translate('decks:noCards')}</p>}
        </CardContent>
      </Card>
    </section>
  );
}

