import {
  Config,
  CreateLinodeRequest,
  Kernel,
  Linode,
  ResizeLinodePayload,
  changeLinodePassword,
  createLinode,
  deleteLinode,
  getLinode,
  getLinodeKernel,
  getLinodeLishToken,
  getLinodes,
  linodeBoot,
  linodeReboot,
  linodeShutdown,
  resizeLinode,
  scheduleOrQueueMigration,
  updateLinode,
} from '@linode/api-v4/lib/linodes';
import {
  APIError,
  DeepPartial,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import { queryKey as accountNotificationsQueryKey } from '../accountNotifications';
import { queryPresets } from '../base';
import {
  getAllLinodeConfigs,
  getAllLinodeKernelsRequest,
  getAllLinodesRequest,
} from './requests';

export const queryKey = 'linodes';

export const useLinodesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<Linode>, APIError[]>(
    [queryKey, 'paginated', params, filter],
    () => getLinodes(params, filter),
    { ...queryPresets.longLived, enabled, keepPreviousData: true }
  );
};

export const useAllLinodesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<Linode[], APIError[]>(
    [queryKey, 'all', params, filter],
    () => getAllLinodesRequest(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

export const useInfiniteLinodesQuery = (filter: Filter = {}) =>
  useInfiniteQuery<ResourcePage<Linode>, APIError[]>(
    [queryKey, 'infinite', filter],
    ({ pageParam }) => getLinodes({ page: pageParam, page_size: 25 }, filter),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );

export const useLinodeQuery = (id: number, enabled = true) => {
  return useQuery<Linode, APIError[]>(
    [queryKey, 'linode', id, 'details'],
    () => getLinode(id),
    {
      enabled,
    }
  );
};

export const useLinodeUpdateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<Linode, APIError[], DeepPartial<Linode>>(
    (data) => updateLinode(id, data),
    {
      onSuccess(linode) {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
        queryClient.setQueryData([queryKey, 'linode', id, 'details'], linode);
      },
    }
  );
};

export const useAllLinodeConfigsQuery = (id: number, enabled = true) => {
  return useQuery<Config[], APIError[]>(
    [queryKey, 'linode', id, 'configs'],
    () => getAllLinodeConfigs(id),
    { enabled }
  );
};

export const useAllLinodeKernelsQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled = true
) => {
  return useQuery<Kernel[], APIError[]>(
    [queryKey, 'linode', 'kernels', params, filter],
    () => getAllLinodeKernelsRequest(params, filter),
    { enabled }
  );
};

export const useLinodeKernelQuery = (kernel: string) => {
  return useQuery<Kernel, APIError[]>(
    [queryKey, 'linode', 'kernels', 'kernel', kernel],
    () => getLinodeKernel(kernel)
  );
};

export const useLinodeLishTokenQuery = (id: number) => {
  return useQuery<{ lish_token: string }, APIError[]>(
    [queryKey, 'linode', id, 'lish-token'],
    () => getLinodeLishToken(id),
    { staleTime: Infinity }
  );
};

export const useDeleteLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteLinode(id), {
    onSuccess() {
      queryClient.removeQueries([queryKey, 'linode', id]);
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
    },
  });
};

export const useCreateLinodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Linode, APIError[], CreateLinodeRequest>(createLinode, {
    onSuccess(linode) {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      queryClient.setQueryData(
        [queryKey, 'linode', linode.id, 'details'],
        linode
      );
    },
  });
};

export const useBootLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { config_id?: number }>(
    ({ config_id }) => linodeBoot(id, config_id),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
        queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
      },
    }
  );
};

export const useRebootLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { config_id?: number }>(
    ({ config_id }) => linodeReboot(id, config_id),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
        queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
      },
    }
  );
};

export const useShutdownLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => linodeShutdown(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
    },
  });
};

export const useLinodeChangePasswordMutation = (id: number) =>
  useMutation<{}, APIError[], { root_pass: string }>(({ root_pass }) =>
    changeLinodePassword(id, root_pass)
  );

export const useLinodeMigrateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { region: string } | undefined>(
    (data) => scheduleOrQueueMigration(id, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
        queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
      },
    }
  );
};

export const useLinodeResizeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], ResizeLinodePayload>(
    (data) => resizeLinode(id, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
        queryClient.invalidateQueries([queryKey, 'linode', id, 'details']);
        queryClient.invalidateQueries(accountNotificationsQueryKey);
      },
    }
  );
};
