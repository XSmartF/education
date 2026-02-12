export const filesQueryKeys = {
  all: ['files'] as const,
  detail: (fileId: string) => ['files', fileId] as const,
};
