import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type {
  APIError,
  NetworkTransfer,
  RegionalNetworkUtilization,
  Stats,
} from '@linode/api-v4';

export const STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';
export const STATS_NOT_READY_MESSAGE =
  'Stats for this Linode are not available yet';

const queryOptions = {
  placeholderData: keepPreviousData,
  refetchInterval: 300_000, // 5 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: false,
  retryOnMount: false,
};

export const useLinodeStats = (id: number, enabled = true) => {
  return useQuery<Stats, APIError[]>({
    ...linodeQueries.linode(id)._ctx.stats,
    enabled,
    ...queryOptions,
  });
};

export const useLinodeStatsByDate = (
  id: number,
  year: string,
  month: string,
  enabled = true,
) => {
  return useQuery<Stats, APIError[]>({
    ...linodeQueries.linode(id)._ctx.statsByDate(year, month),
    enabled,
    ...queryOptions,
  });
};

export const useLinodeTransfer = (id: number, enabled = true) => {
  return useQuery<RegionalNetworkUtilization, APIError[]>({
    ...linodeQueries.linode(id)._ctx.transfer,
    enabled,
    ...queryOptions,
  });
};

export const useLinodeTransferByDate = (
  id: number,
  year: string,
  month: string,
  enabled = true,
) => {
  return useQuery<NetworkTransfer, APIError[]>({
    ...linodeQueries.linode(id)._ctx.transferByDate(year, month),
    enabled,
    ...queryOptions,
  });
};
