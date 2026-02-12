import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fileApi } from '../api/file-api';
import type { FileItem } from '../model/types';
import { filesQueryKeys } from '../model/query-keys';
import { saveBlobFile } from '@/shared/utils/file-download';

type UseFilesResult = {
  items: FileItem[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  upload: (file: File) => Promise<FileItem>;
  remove: (id: string) => Promise<void>;
  download: (id: string) => Promise<void>;
};

export function useFiles(): UseFilesResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: filesQueryKeys.all,
    queryFn: () => fileApi.list(),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => fileApi.upload(file),
    onSuccess: (created) => {
      queryClient.setQueryData<FileItem[]>(filesQueryKeys.all, (prev = []) => [created, ...prev]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => fileApi.remove(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<FileItem[]>(
        filesQueryKeys.all,
        (prev = []) => prev.filter((x) => x.id !== id)
      );
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (id: string) => fileApi.download(id),
    onSuccess: (result) => {
      saveBlobFile(result.blob, result.fileName);
    },
  });

  const errorMessage = query.error instanceof Error ? query.error.message : '';

  return {
    items: query.data ?? [],
    loading: query.isLoading,
    error: errorMessage,
    refresh: () => queryClient.invalidateQueries({ queryKey: filesQueryKeys.all }).then(() => undefined),
    upload: (file: File) => uploadMutation.mutateAsync(file),
    remove: (id: string) => removeMutation.mutateAsync(id),
    download: (id: string) => downloadMutation.mutateAsync(id).then(() => undefined),
  };
}
