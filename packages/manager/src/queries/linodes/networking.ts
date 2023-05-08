import { useMutation, useQuery } from 'react-query';
import { queryKey } from './linodes';
import { getAll } from 'src/utilities/getAll';
import {
  APIError,
  Filter,
  IPAddress,
  IPRange,
  IPRangeInformation,
  LinodeIPsResponse,
  Params,
  getIPs,
  getIPv6RangeInfo,
  getIPv6Ranges,
  getLinodeIPs,
  removeIPAddress,
  removeIPv6Range,
  updateIP,
} from '@linode/api-v4';

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
  return useMutation<
    IPAddress,
    APIError[],
    { address: string; rdns?: string | null }
  >(({ address, rdns }) => updateIP(address, rdns));
};

export const useLinodeIPDeleteMutation = (
  linodeId: number,
  address: string
) => {
  return useMutation<{}, APIError[]>(() =>
    removeIPAddress({ linodeID: linodeId, address })
  );
};

export const useLinodeRemoveRangeMutation = (range: string) => {
  return useMutation<{}, APIError[]>(() => removeIPv6Range({ range }));
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
