import { ServiceTarget, getServiceTargets } from '@linode/api-v4';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

export const queryKey = 'entrypoint';

export const useServiceTargetsQuery = (params: Params, filter: Filter) => {
  return useQuery<ResourcePage<ServiceTarget>, APIError[]>(
    [`${queryKey}-list`, 'paginated', params, filter],
    () => getServiceTargets(params, filter),
    { keepPreviousData: true }
  );
};
