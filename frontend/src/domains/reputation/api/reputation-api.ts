import { api } from '@/shared/api/http-client';
import type { ReputationProfile } from '../model/types';

export const reputationApi = {
  getMine: () => api.get<ReputationProfile>('/reputation/me'),
};

