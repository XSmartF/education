import { useTranslation } from 'react-i18next';
import { useReputation } from '../hooks/use-reputation';
import { formatDateTime } from '@/shared/utils/format';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageIntro,
  Progress,
  Skeleton,
} from '@/shared/ui';

export default function ReputationPage() {
  const { t: translate } = useTranslation(['reputation', 'common']);
  const { profile } = useReputation();

  const data = profile.data;

  return (
    <section className="space-y-6">
      <PageIntro title={translate('reputation:title')} description={translate('reputation:subtitle')} />

      {profile.isLoading && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-44" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`score-skeleton-${index}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
            <Skeleton className="h-4 w-56" />
          </CardContent>
        </Card>
      )}

      {data && (
        <Card className="border-primary/10 bg-card/90">
          <CardHeader>
            <CardTitle>{translate('reputation:myScore')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ScoreRow label={translate('reputation:learningScore')} value={data.learningScore} />
            <ScoreRow label={translate('reputation:contributionScore')} value={data.contributionScore} />
            <ScoreRow label={translate('reputation:teachingScore')} value={data.teachingScore} />
            <ScoreRow label={translate('reputation:trustScore')} value={data.trustScore} />
            <p className="text-xs text-muted-foreground">
              {translate('reputation:updatedAt')}: {formatDateTime(data.updatedAt)}
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const percent = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <Progress value={percent} />
    </div>
  );
}

