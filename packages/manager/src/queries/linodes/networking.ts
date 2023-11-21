import {
  APIError,
  CreateIPv6RangePayload,
  Filter,
  IPAddress,
  IPAllocationRequest,
  IPAssignmentPayload,
  IPRange,
  IPRangeInformation,
  IPSharingPayload,
  LinodeIPsResponse,
  Params,
  allocateIPAddress,
  assignAddresses,
  createIPv6Range,
  getIPv6RangeInfo,
  getLinodeIPs,
  removeIPAddress,
  removeIPv6Range,
  shareAddresses,
  updateIP,
} from '@linode/api-v4';
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKey } from './linodes';
import { getAllIPv6Ranges, getAllIps } from './requests';

export const useLinodeIPsQuery = (
  linodeId: number,
  enabled: boolean = true
) => {
  return useQuery<LinodeIPsResponse, APIError[]>(
    [queryKey, 'linode', linodeId, 'ips'],
    () => getLinodeIPs(linodeId),
    { enabled }
  );
};

export const useLinodeIPMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IPAddress,
    APIError[],
    { address: string; rdns?: null | string }
  >(({ address, rdns }) => updateIP(address, rdns), {
    onSuccess() {
      invalidateAllIPsQueries(queryClient);
    },
  });
};

export const useLinodeIPDeleteMutation = (
  linodeId: number,
  address: string
) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(
    () => removeIPAddress({ address, linodeID: linodeId }),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linodeId,
          'details',
        ]);
        queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'ips']);
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
        queryClient.invalidateQueries([queryKey, 'ips']);
      },
    }
  );
};

export const useLinodeRemoveRangeMutation = (range: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => removeIPv6Range({ range }), {
    onSuccess() {
      invalidateAllIPsQueries(queryClient);
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
      queryClient.invalidateQueries([queryKey, 'ips']);
      queryClient.invalidateQueries([queryKey, 'ipv6']);
    },
  });
};

export const useLinodeShareIPMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPSharingPayload>(shareAddresses, {
    onSuccess() {
      invalidateAllIPsQueries(queryClient);
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
    },
  });
};

export const useAssignAdressesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPAssignmentPayload>(assignAddresses, {
    onSuccess(_, variables) {
      for (const { linode_id } of variables.assignments) {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linode_id,
          'details',
        ]);
        queryClient.invalidateQueries([queryKey, 'linode', linode_id, 'ips']);
      }
      queryClient.invalidateQueries([queryKey, 'paginated']);
      queryClient.invalidateQueries([queryKey, 'all']);
      queryClient.invalidateQueries([queryKey, 'infinite']);
    },
  });
};

export const useAllocateIPMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPAllocationRequest>(
    (data) => allocateIPAddress(linodeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          linodeId,
          'details',
        ]);
        queryClient.invalidateQueries([queryKey, 'linode', linodeId, 'ips']);
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
        queryClient.invalidateQueries([queryKey, 'ips']);
      },
    }
  );
};

export const useCreateIPv6RangeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], CreateIPv6RangePayload>(createIPv6Range, {
    onSuccess(_, variables) {
      queryClient.invalidateQueries([queryKey, 'ips']);
      queryClient.invalidateQueries([queryKey, 'ipv6']);
      if (variables.linode_id) {
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          variables.linode_id,
          'details',
        ]);
        queryClient.invalidateQueries([
          queryKey,
          'linode',
          variables.linode_id,
          'ips',
        ]);
        queryClient.invalidateQueries([queryKey, 'paginated']);
        queryClient.invalidateQueries([queryKey, 'all']);
        queryClient.invalidateQueries([queryKey, 'infinite']);
      }
    },
  });
};

export const useAllIPsQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true
) => {
  return useQuery<IPAddress[], APIError[]>(
    [queryKey, 'ips', params, filter],
    () => getAllIps(params, filter),
    { enabled }
  );
};

export const useAllIPv6RangesQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true
) => {
  return useQuery<IPRange[], APIError[]>(
    [queryKey, 'ipv6', 'ranges', params, filter],
    () => getAllIPv6Ranges(params, filter),
    { enabled }
  );
};

export const useAllDetailedIPv6RangesQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true
) => {
  const { data: ranges } = useAllIPv6RangesQuery(params, filter, enabled);
  return useQuery<IPRangeInformation[], APIError[]>(
    [queryKey, 'ipv6', 'ranges', 'details', params, filter],
    async () => {
      return await Promise.all(
        (ranges ?? []).map((range) => getIPv6RangeInfo(range.range))
      );
    },
    { enabled: ranges !== undefined && enabled }
  );
};

const invalidateAllIPsQueries = (queryClient: QueryClient) => {
  // Because IPs may be shared between Linodes, we can't simpily invalidate one store.
  // Here, we look at all of our active query keys, and invalidate any queryKey that contains 'ips'.
  queryClient.invalidateQueries({
    predicate: (query) => {
      if (Array.isArray(query.queryKey)) {
        return query.queryKey[0] === queryKey && query.queryKey[3] === 'ips';
      }
      return false;
    },
  });
};
