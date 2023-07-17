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
  getIPs,
  getIPv6RangeInfo,
  getIPv6Ranges,
  getLinodeIPs,
  removeIPAddress,
  removeIPv6Range,
  shareAddresses,
  updateIP,
} from '@linode/api-v4';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { getAll } from 'src/utilities/getAll';

import { queryKey } from './linodes';

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
      queryClient.invalidateQueries([queryKey]);
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
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );
};

export const useLinodeRemoveRangeMutation = (range: string) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[]>(() => removeIPv6Range({ range }), {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useLinodeShareIPMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPSharingPayload>(shareAddresses, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useAssignAdressesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPAssignmentPayload>(assignAddresses, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
    },
  });
};

export const useAllocateIPMutation = (linodeId: number) => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], IPAllocationRequest>(
    (data) => allocateIPAddress(linodeId, data),
    {
      onSuccess() {
        queryClient.invalidateQueries([queryKey]);
      },
    }
  );
};

export const useCreateIPv6RangeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], CreateIPv6RangePayload>(createIPv6Range, {
    onSuccess() {
      queryClient.invalidateQueries([queryKey]);
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

const getAllIps = (passedParams: Params = {}, passedFilter: Filter = {}) =>
  getAll<IPAddress>((params, filter) =>
    getIPs({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

const getAllIPv6Ranges = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<IPRange>((params, filter) =>
    getIPv6Ranges(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);
