import { api } from '@/shared/api/http-client';
import type { FileItem } from '../model/types';

export const toTextFileFormData = (
  fileName: string,
  content: string,
  contentType = 'text/plain'
) => {
  const form = new FormData();
  const blob = new Blob([content], { type: contentType });
  form.append('file', blob, fileName);
  return form;
};

export const fileApi = {
  list: () => api.get<FileItem[]>('/files'),
  get: (id: string) => api.get<FileItem>(`/files/${id}`),
  upload: (form: FormData) => api.upload<FileItem>('/files', form),
  replace: (id: string, form: FormData) => api.put<FileItem>(`/files/${id}`, form),
  download: (id: string) => api.download(`/files/${id}/download`),
  remove: (id: string) => api.delete<void>(`/files/${id}`),
};
