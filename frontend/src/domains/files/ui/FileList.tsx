import { useState, type ChangeEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useFiles } from '../hooks/use-files';
import { formatBytes, formatDateTime } from '@/shared/utils/format';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from '@/shared/ui';

type Props = {
  canEdit: boolean;
};

export function FileList({ canEdit }: Props) {
  const { t: translate } = useTranslation('files');
  const { items, loading, error, upload, remove, download } = useFiles();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const onSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const submit = async () => {
    if (!canEdit || !selectedFile) {
      return;
    }

    await upload(selectedFile);
    setSelectedFile(null);
    setInputKey((prev) => prev + 1);
  };

  return (
    <Card className="border-primary/10 bg-card/90">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{translate('title')}</CardTitle>
        {!canEdit && <Badge variant="secondary">{translate('readOnly')}</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input key={inputKey} type="file" onChange={onSelect} disabled={!canEdit} />
          <Button onClick={submit} disabled={!canEdit || !selectedFile}>
            {translate('uploadButton')}
          </Button>
        </div>

        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`file-skeleton-${index}`} className="rounded-lg border bg-muted/20 p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-56" />
                  <Skeleton className="h-4 w-72" />
                  <Skeleton className="h-4 w-52" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        {error && <p className="text-sm text-destructive">{error}</p>}
        {!loading && !items.length && <p className="text-sm text-muted-foreground">{translate('empty')}</p>}

        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-medium">{item.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {translate('size')}: {formatBytes(item.size)} | {translate('contentType')}:{' '}
                  {item.contentType}
                </p>
                <p className="text-xs text-muted-foreground">
                  {translate('createdAt')}: {formatDateTime(item.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/files/$fileId" params={{ fileId: item.id }}>
                    {translate('detail')}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => download(item.id)}>
                  {translate('download')}
                </Button>
                {canEdit && (
                  <Button variant="destructive" size="sm" onClick={() => remove(item.id)}>
                    {translate('remove')}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
