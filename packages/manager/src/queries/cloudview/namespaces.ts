import {
  CreateNameSpacePayload,
  Namespace,
  NamespaceApiKey,
  createCloudViewNamespace,
  deleteCloudViewNamespace,
  getCloudViewNamespaces,
  getNamespaceApiKey,
} from '@linode/api-v4/lib/cloudview';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryPresets } from '../base';

export const queryKey = 'cloudview-namespaces';

export const useNamespaceApiKey = (id: number, enabled: boolean = true) => {
  return useQuery<NamespaceApiKey, APIError[]>(
    [queryKey, 'api-key', id],
    () => getNamespaceApiKey(id),
    {
      enabled,
    }
  );
};

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

export const useDeleteCloudViewNamespace = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteCloudViewNamespace(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey, 'paginated']);
    },
  });
};
