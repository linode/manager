import {
  CreateNameSpacePayload,
  Namespace,
  createCloudViewNamespace,
  getCloudViewNamespaces,
} from '@linode/api-v4/lib/cloudview';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { queryPresets } from '../base';

export const queryKey = 'cloudview-namespaces';

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

export const useCreateCloudViewNamespace = () => {
  const queryClient = useQueryClient();
  return useMutation<Namespace, APIError[], CreateNameSpacePayload>(
    (data) => createCloudViewNamespace(data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'paginated']);
      },
    }
  );
};
