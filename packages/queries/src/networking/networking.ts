import { createIPv6Range, getIPv6RangeInfo } from '@linode/api-v4';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useMemo } from 'react';

import { linodeQueries } from '../linodes/linodes';
import { getAllIps, getAllIPv6Ranges } from './requests';

import type {
  APIError,
  CreateIPv6RangePayload,
  Filter,
  IPAddress,
  IPRange,
  IPRangeInformation,
  Params,
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
