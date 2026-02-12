import { useEffect, useState } from 'react';
import { fileApi, toTextFileFormData } from '../api/file-api';
import type { FileItem } from '../model/types';

type UseFilesResult = {
  items: FileItem[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  upload: (fileName: string, content: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  download: (id: string) => Promise<{ fileName: string; size: number }>;
};

export function useFiles(): UseFilesResult {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fileApi.list();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai du lieu');
    } finally {
      setLoading(false);
    }
  };

  const upload = async (fileName: string, content: string) => {
    const created = await fileApi.upload(toTextFileFormData(fileName, content));
    setItems((prev) => [created, ...prev]);
  };

  const remove = async (id: string) => {
    await fileApi.remove(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const download = async (id: string) => {
    const result = await fileApi.download(id);
    return { fileName: result.fileName, size: result.blob.size };
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { items, loading, error, refresh, upload, remove, download };
}
