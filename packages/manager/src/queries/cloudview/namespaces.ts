import {
  Namespace,
  getCloudViewNamespaces,
} from '@linode/api-v4/lib/cloudview';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';

import { queryPresets } from '../base';

export const queryKey = 'cloudview';

export const useCloudViewNameSpacesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<Namespace>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getCloudViewNamespaces(params, filter),
    { ...queryPresets.longLived, enabled, keepPreviousData: true }
  );
};
