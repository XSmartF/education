import { useQuery } from '@tanstack/react-query';
import { reputationApi } from '../api/reputation-api';
import { reputationQueryKeys } from '../model/query-keys';

export function useReputation() {
  const profile = useQuery({
    queryKey: reputationQueryKeys.mine,
    queryFn: () => reputationApi.getMine(),
  });

  return { profile };
}

