import {
  createIPv6Range,
  getIP,
  getIPv6RangeInfo,
  getReservedIP,
  getReservedIPs,
  reserveIP,
  unReserveIP,
  updateIP,
  updateReservedIP,
} from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';

import { linodeQueries } from '../linodes/linodes';
import { nodebalancerQueries } from '../nodebalancers';
import {
  getAllIps,
  getAllIPv6Ranges,
  getAllReservedIPsTypes,
} from './requests';

import type { PriceType } from '@akamai/compute-ui-core/api';
import type {
  APIError,
  CreateIPv6RangePayload,
  Filter,
  IPAddress,
  IPRange,
  IPRangeInformation,
  Params,
  ReserveIPPayload,
  ResourcePage,
} from '@linode/api-v4';

export const networkingQueries = createQueryKeys('networking', {
  ips: (params: Params = {}, filter: Filter = {}) => ({
    queryFn: () => getAllIps(params, filter),
    queryKey: [params, filter],
  }),
  ipv6: {
    contextQueries: {
      range: (range: string) => ({
        queryFn: () => getIPv6RangeInfo(range),
        queryKey: [range],
      }),
      ranges: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getAllIPv6Ranges(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  ip: (address: string) => ({
    queryFn: () => getIP(address),
    queryKey: [address],
  }),
  reservedIPs: {
    contextQueries: {
      infinite: (filter: Filter = {}) => ({
        queryFn: ({ pageParam }) =>
          getReservedIPs({ page: pageParam as number, page_size: 25 }, filter),
        queryKey: [filter],
      }),
      paginated: (params: Params = {}, filter: Filter = {}) => ({
        queryFn: () => getReservedIPs(params, filter),
        queryKey: [params, filter],
      }),
    },
    queryKey: null,
  },
  reservedIP: (address: string) => ({
    queryFn: () => getReservedIP(address),
    queryKey: [address],
  }),
  reservedIPTypes: {
    queryFn: getAllReservedIPsTypes,
    queryKey: null,
  },
});

export const useAllIPsQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true,
) => {
  return useQuery<IPAddress[], APIError[]>({
    ...networkingQueries.ips(params, filter),
    enabled,
  });
};

export const useIPAddressQuery = (address: string, enabled: boolean = true) => {
  return useQuery<IPAddress, APIError[]>({
    ...networkingQueries.ip(address),
    enabled,
  });
};

export const useAllIPv6RangesQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true,
) => {
  return useQuery<IPRange[], APIError[]>({
    ...networkingQueries.ipv6._ctx.ranges(params, filter),
    enabled,
  });
};

export const useAllDetailedIPv6RangesQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true,
) => {
  const { data: ranges } = useAllIPv6RangesQuery(params, filter, enabled);

  const queryResults = useQueries({
    queries:
      ranges?.map((range) => networkingQueries.ipv6._ctx.range(range.range)) ??
      [],
  });

  // @todo use React Query's combine once we upgrade to v5
  const data = queryResults.reduce<IPRangeInformation[]>(
    (detailedRanges, query) => {
      if (query.data) {
        detailedRanges.push(query.data);
      }
      return detailedRanges;
    },
    [],
  );

  const stableData = useMemo(() => data, [JSON.stringify(data)]);

  return { data: stableData };
};

export const useCreateIPv6RangeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<{}, APIError[], CreateIPv6RangePayload>({
    mutationFn: createIPv6Range,
    onSuccess(_, variables) {
      // Invalidate networking queries
      queryClient.invalidateQueries({ queryKey: networkingQueries.ips._def });
      queryClient.invalidateQueries({
        queryKey: networkingQueries.ipv6.queryKey,
      });

      // Invalidate Linode queries
      if (variables.linode_id) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(variables.linode_id).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(variables.linode_id)._ctx.ips.queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linodes.queryKey,
        });
      }
    },
  });
};

export const useUpdateIPMutation = (address: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    IPAddress,
    APIError[],
    { address: string; rdns: null | string | undefined; reserved: boolean }
  >({
    mutationFn: (data) => updateIP(address, { reserved: data.reserved }),
    onSuccess(ip) {
      queryClient.invalidateQueries({
        queryKey: networkingQueries.ips._def,
      });
      queryClient.setQueryData<IPAddress>(
        networkingQueries.ip(address).queryKey,
        ip,
      );
      // Invalidate Reserved IPs queries (so the list updates)
      queryClient.invalidateQueries({
        queryKey: networkingQueries.reservedIPs.queryKey,
      });
      // Invalidate Linode queries
      if (ip.linode_id) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(ip.linode_id).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(ip.linode_id)._ctx.ips.queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linodes.queryKey,
        });
      }
    },
  });
};

export const useReservedIPsQuery = (
  params?: Params,
  filter?: Filter,
  enabled: boolean = true,
) => {
  return useQuery<ResourcePage<IPAddress>, APIError[]>({
    ...networkingQueries.reservedIPs._ctx.paginated(params, filter),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useReservedIPsInfiniteQuery = (
  filter: Filter,
  enabled?: boolean,
) =>
  useInfiniteQuery<ResourcePage<IPAddress>, APIError[]>({
    ...networkingQueries.reservedIPs._ctx.infinite(filter),
    enabled,
    getNextPageParam: ({ page, pages }) => {
      if (page === pages) {
        return undefined;
      }
      return page + 1;
    },
    initialPageParam: 1,
    retry: false,
  });

export const useReservedIPQuery = (address: string, enabled: boolean = true) =>
  useQuery<IPAddress, APIError[]>({
    ...networkingQueries.reservedIP(address),
    enabled,
  });

export const useReserveIPMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<IPAddress, APIError[], ReserveIPPayload>({
    mutationFn: reserveIP,
    onSuccess(reservedIP) {
      // Invalidate Reserved IPs queries
      queryClient.invalidateQueries({
        queryKey: networkingQueries.reservedIPs.queryKey,
      });
      queryClient.setQueryData<IPAddress>(
        networkingQueries.reservedIP(reservedIP.address).queryKey,
        reservedIP,
      );
      // Invalidate networking IPs list
      queryClient.invalidateQueries({
        queryKey: networkingQueries.ips._def,
      });
      // Update the individual IP address query so useIPAddressQuery gets the updated reserved status
      queryClient.setQueryData<IPAddress>(
        networkingQueries.ip(reservedIP.address).queryKey,
        reservedIP,
      );
      // Invalidate Linode queries (so the Reserved badge appears)
      if (reservedIP.linode_id) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(reservedIP.linode_id).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(reservedIP.linode_id)._ctx.ips
            .queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linodes.queryKey,
        });
      }
      // If the IP is assigned to a NodeBalancer, invalidate NodeBalancer queries
      if (reservedIP.assigned_entity?.type === 'nodebalancer') {
        queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancers.queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancer(
            reservedIP.assigned_entity.id,
          ).queryKey,
        });
      }
    },
  });
};

export const useUpdateReservedIPMutation = (address: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    IPAddress,
    APIError[],
    { address: string; tags: null | string[] }
  >({
    mutationFn: (data) => updateReservedIP(address, data.tags),
    onSuccess(reservedIP) {
      queryClient.invalidateQueries({
        queryKey: networkingQueries.reservedIPs.queryKey,
      });
      queryClient.setQueryData<IPAddress>(
        networkingQueries.reservedIP(reservedIP.address).queryKey,
        reservedIP,
      );
    },
  });
};

export const useUnReserveIPMutation = (address: string) => {
  const queryClient = useQueryClient();
  return useMutation<object, APIError[], { linode_id?: null | number }>({
    mutationFn: () => unReserveIP(address),
    onSuccess(_, variables) {
      // Get cached IP data to check what linode_id we have
      const cachedIP = queryClient.getQueryData<IPAddress>(
        networkingQueries.ip(address).queryKey,
      );

      // Invalidate Reserved IPs queries
      queryClient.invalidateQueries({
        queryKey: networkingQueries.reservedIPs.queryKey,
      });

      queryClient.removeQueries({
        queryKey: networkingQueries.reservedIP(address).queryKey,
      });

      // Invalidate networking IPs list
      queryClient.invalidateQueries({
        queryKey: networkingQueries.ips._def,
      });

      // Immediately update the individual IP address query to set reserved: false
      // This provides instant UI feedback instead of waiting for a refetch
      if (cachedIP) {
        queryClient.setQueryData<IPAddress>(
          networkingQueries.ip(address).queryKey,
          { ...cachedIP, reserved: false },
        );
      } else {
        // Fallback to invalidation if no cached data exists
        queryClient.invalidateQueries({
          queryKey: networkingQueries.ip(address).queryKey,
        });
      }

      const linodeId = variables.linode_id ?? cachedIP?.linode_id;

      // Invalidate Linode queries (so the Reserved badge disappears)
      if (linodeId) {
        queryClient.invalidateQueries({
          exact: true,
          queryKey: linodeQueries.linode(linodeId).queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linode(linodeId)._ctx.ips.queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: linodeQueries.linodes.queryKey,
        });
      }

      // If the IP is assigned to a NodeBalancer, invalidate NodeBalancer queries
      if (cachedIP?.assigned_entity?.type === 'nodebalancer') {
        queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancers.queryKey,
        });
        queryClient.invalidateQueries({
          queryKey: nodebalancerQueries.nodebalancer(
            cachedIP.assigned_entity.id,
          ).queryKey,
        });
      }
    },
  });
};

export const useReservedIPTypesQuery = () => {
  return useQuery<PriceType[], APIError[]>({
    ...networkingQueries.reservedIPTypes,
  });
};
