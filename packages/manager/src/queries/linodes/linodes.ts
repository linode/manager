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
  getLinodeConfigs,
  getLinodeKernel,
  getLinodeKernels,
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

import { getAll } from 'src/utilities/getAll';

import { queryKey as accountQueryKey } from '../account';
import { queryPresets } from '../base';

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
    [queryKey, 'linode', id],
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
        queryClient.invalidateQueries([queryKey]);
        queryClient.setQueryData([queryKey, 'linode', id], linode);
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

/** Use with care; originally added to request all Linodes in a given region for IP sharing and transfer */
const getAllLinodesRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Linode>((params, filter) =>
    getLinodes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

const getAllLinodeKernelsRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Kernel>((params, filter) =>
    getLinodeKernels(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);

const getAllLinodeConfigs = (id: number) =>
  getAll<Config>((params, filter) =>
    getLinodeConfigs(id, params, filter)
  )().then((data) => data.data);

export const useDeleteLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteLinode(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useCreateLinodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Linode, APIError[], CreateLinodeRequest>(createLinode, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useBootLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { config_id?: number }>(
    ({ config_id }) => linodeBoot(id, config_id),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
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
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );
};

export const useShutdownLinodeMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => linodeShutdown(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useLinodeChangePasswordMutation = (id: number) =>
  useMutation<{}, APIError[], { root_pass: string }>(({ root_pass }) =>
    changeLinodePassword(id, root_pass)
  );

export const useLinodeDeleteMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => deleteLinode(id), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useLinodeMigrateMutation = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], { region: string } | undefined>(
    (data) => scheduleOrQueueMigration(id, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
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
        queryClient.invalidateQueries([queryKey]);
        queryClient.invalidateQueries([accountQueryKey, 'notifications']);
      },
    }
  );
};
