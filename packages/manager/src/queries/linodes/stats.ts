import { useQuery } from '@tanstack/react-query';

import { linodeQueries } from './linodes';

import type { APIError, NetworkTransfer, Stats } from '@linode/api-v4';

export const STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';
export const STATS_NOT_READY_MESSAGE =
  'Stats for this Linode are not available yet';

export const useLinodeStats = (id: number, enabled = true) => {
  return useQuery<Stats, APIError[]>({
    ...linodeQueries.linode(id)._ctx.stats,
    enabled,
    refetchInterval: 30000,
    // We need to disable retries because the API will
    // error if stats are not ready. If the default retry policy
    // is used, a "stats not ready" state can't be shown because the
    // query is still trying to request.
    retry: false,
  });
};

export const useLinodeStatsByDate = (
  id: number,
  year: string,
  month: string,
  enabled = true
) => {
  return useQuery<Stats, APIError[]>({
    ...linodeQueries.linode(id)._ctx.statsByDate(year, month),
    enabled,
    refetchInterval: 30000,
    // We need to disable retries because the API will
    // error if stats are not ready. If the default retry policy
    // is used, a "stats not ready" state can't be shown because the
    // query is still trying to request.
    retry: false,
  });
};

export const useLinodeTransferByDate = (
  id: number,
  year: string,
  month: string,
  enabled = true
) => {
  return useQuery<NetworkTransfer, APIError[]>({
    ...linodeQueries.linode(id)._ctx.transfer(year, month),
    enabled,
  });
};
