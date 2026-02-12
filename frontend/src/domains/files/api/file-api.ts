import { api } from '@/shared/api/http-client';
import type { FileItem } from '../model/types';

const toFormData = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return form;
};

export const fileApi = {
  list: () => api.get<FileItem[]>('/files'),
  get: (id: string) => api.get<FileItem>(`/files/${id}`),
  upload: (file: File) => api.upload<FileItem>('/files', file),
  replace: (id: string, file: File) =>
    api.put<FileItem, FormData>(`/files/${id}`, toFormData(file)),
  download: (id: string) => api.download(`/files/${id}/download`),
  remove: (id: string) => api.delete<void>(`/files/${id}`),
};
