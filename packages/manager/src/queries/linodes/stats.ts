import {
  APIError,
  NetworkTransfer,
  Stats,
  getLinodeStats,
  getLinodeStatsByDate,
  getLinodeTransferByDate,
} from '@linode/api-v4';
import { DateTime } from 'luxon';
import { useQuery } from '@tanstack/react-query';

import { parseAPIDate } from 'src/utilities/date';

import { queryKey } from './linodes';

export const STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';
export const STATS_NOT_READY_MESSAGE =
  'Stats for this Linode are not available yet';

const getIsTooEarlyForStats = (linodeCreated?: string) => {
  if (!linodeCreated) {
    return false;
  }

  return parseAPIDate(linodeCreated) > DateTime.local().minus({ minutes: 7 });
};

export const useLinodeStats = (
  id: number,
  enabled = true,
  linodeCreated?: string
) => {
  return useQuery<Stats, APIError[]>(
    [queryKey, 'linode', id, 'stats'],
    getIsTooEarlyForStats(linodeCreated)
      ? () => Promise.reject([{ reason: STATS_NOT_READY_MESSAGE }])
      : () => getLinodeStats(id),
    // We need to disable retries because the API will
    // error if stats are not ready. If the default retry policy
    // is used, a "stats not ready" state can't be shown because the
    // query is still trying to request.
    { enabled, refetchInterval: 30000, retry: false }
  );
};

export const useLinodeStatsByDate = (
  id: number,
  year: string,
  month: string,
  enabled = true,
  linodeCreated?: string
) => {
  return useQuery<Stats, APIError[]>(
    [queryKey, 'linode', id, 'stats', 'date', year, month],
    getIsTooEarlyForStats(linodeCreated)
      ? () => Promise.reject([{ reason: STATS_NOT_READY_MESSAGE }])
      : () => getLinodeStatsByDate(id, year, month),
    // We need to disable retries because the API will
    // error if stats are not ready. If the default retry policy
    // is used, a "stats not ready" state can't be shown because the
    // query is still trying to request.
    { enabled, refetchInterval: 30000, retry: false }
  );
};

export const useLinodeTransferByDate = (
  id: number,
  year: string,
  month: string,
  enabled = true
) => {
  return useQuery<NetworkTransfer, APIError[]>(
    [queryKey, 'linode', id, 'transfer', year, month],
    () => getLinodeTransferByDate(id, year, month),
    { enabled }
  );
};
