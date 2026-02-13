import { useState, type ChangeEvent } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fileApi } from '@/domains/files/api/file-api';
import type { FileItem } from '@/domains/files/model/types';
import { filesQueryKeys } from '@/domains/files/model/query-keys';
import { useAuth } from '@/domains/auth/hooks/use-auth';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  PageIntro,
  Skeleton,
} from '@/shared/ui';
import { saveBlobFile } from '@/shared/utils/file-download';
import { formatBytes, formatDateTime } from '@/shared/utils/format';

export default function FileDetailPage() {
  const { t: translate } = useTranslation('files');
  const auth = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { fileId } = useParams({ from: '/files/$fileId' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [isReplaceDialogOpen, setIsReplaceDialogOpen] = useState(false);

  const query = useQuery({
    queryKey: filesQueryKeys.detail(fileId),
    queryFn: () => fileApi.get(fileId),
    enabled: auth.isAuthenticated,
  });

  const replaceMutation = useMutation({
    mutationFn: (file: File) => fileApi.replace(fileId, file),
    onSuccess: (updated) => {
      queryClient.setQueryData<FileItem>(filesQueryKeys.detail(fileId), updated);
      queryClient.setQueryData<FileItem[]>(
        filesQueryKeys.all,
        (prev = []) => prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setSelectedFile(null);
      setInputKey((prev) => prev + 1);
      setIsReplaceDialogOpen(false);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => fileApi.remove(fileId),
    onSuccess: () => {
      queryClient.setQueryData<FileItem[]>(filesQueryKeys.all, (prev = []) =>
        prev.filter((item) => item.id !== fileId)
      );
      queryClient.removeQueries({ queryKey: filesQueryKeys.detail(fileId) });
      navigate({ to: '/files' });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: () => fileApi.download(fileId),
    onSuccess: (result) => {
      saveBlobFile(result.blob, result.fileName);
    },
  });

  const onSelect = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const replace = async () => {
    if (!selectedFile) {
      return;
    }

    await replaceMutation.mutateAsync(selectedFile);
  };

  if (query.isLoading) {
    return (
      <section className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-full max-w-lg" />
        </div>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-10 w-full" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{translate('notFound')}</p>
        <Button asChild variant="ghost">
          <Link to="/files">{translate('back')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <PageIntro
        title={translate('detailTitle')}
        description={translate('detailSubtitle')}
        actions={
          <Button asChild variant="ghost" type="button">
            <Link to="/files">{translate('back')}</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{query.data.fileName}</CardTitle>
          <Badge variant="outline">{query.data.contentType}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {translate('size')}: {formatBytes(query.data.size)}
          </p>
          <p className="text-sm text-muted-foreground">
            {translate('createdAt')}: {formatDateTime(query.data.createdAt)}
          </p>

          <div className="flex flex-wrap gap-2">
            <Dialog open={isReplaceDialogOpen} onOpenChange={setIsReplaceDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={!auth.isAuthenticated}>{translate('replace')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{translate('replace')}</DialogTitle>
                </DialogHeader>
                <Input key={inputKey} type="file" onChange={onSelect} disabled={!auth.isAuthenticated} />
                <DialogFooter>
                  <Button onClick={replace} disabled={!auth.isAuthenticated || !selectedFile}>
                    {translate('replace')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              variant="ghost"
              onClick={() => downloadMutation.mutate()}
              disabled={downloadMutation.isPending}
            >
              {translate('download')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending || !auth.isAuthenticated}
            >
              {translate('remove')}
            </Button>
            <Button asChild variant="ghost" type="button">
              <Link to="/files">{translate('back')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
