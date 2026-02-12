import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';

export default function NotFoundPage() {
  const { t: translate } = useTranslation('notFound');

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{translate('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button asChild variant="ghost">
          <Link to="/">{translate('backHome')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
