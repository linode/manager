import { NetworkTransfer } from '@linode/api-v4/lib/account/types';
import { APIError } from '@linode/api-v4/lib/types';
import { DateTime } from 'luxon';
import { useQuery } from 'react-query';
import { parseAPIDate } from 'src/utilities/date';
import { getAll } from 'src/utilities/getAll';
import { listToItemsByID, queryPresets } from './base';
import {
  Linode,
  getLinodes,
  getLinodeStatsByDate,
  Stats,
  getLinodeTransferByDate,
} from '@linode/api-v4/lib/linodes';

export const queryKey = 'linode';

export const STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';
export const STATS_NOT_READY_MESSAGE =
  'Stats for this Linode are not yet available - check back later';

interface LinodeData {
  results: number;
  linodes: Record<string, Linode>;
}

export const useLinodesQuery = (
  params: any = {},
  filter: any = {},
  enabled: boolean = true
) => {
  return useQuery<LinodeData, APIError[]>(
    [queryKey, params, filter],
    () => getLinodesRequest(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

export const useAllLinodesQuery = (
  params: any = {},
  filter: any = {},
  enabled: boolean = true
) => {
  return useQuery<Linode[], APIError[]>(
    [`${queryKey}-all`, params, filter],
    () => getAllLinodesRequest(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

const getIsTooEarlyForStats = (linodeCreated?: string) => {
  if (!linodeCreated) {
    return false;
  }

  return parseAPIDate(linodeCreated) > DateTime.local().minus({ minutes: 1 });
};

export const useLinodeNetworkStatsByDate = (
  id: number,
  year: string,
  month: string,
  linodeCreated?: string
) => {
  return useQuery<Stats, APIError[]>(
    [`${queryKey}-stats`, id, year, month],
    // If the Linode was created within the last 7 minutes,
    // mock an API failure so the real API is not actually used.
    getIsTooEarlyForStats(linodeCreated)
      ? () => Promise.reject([{ reason: STATS_NOT_READY_MESSAGE }])
      : () => getLinodeStatsByDate(id, year, month),
    // Don't retry because React Query will spam our mock failure and the real
    // API if stats are not ready. Refetching will resolve any errors eventually.
    { refetchInterval: 30000, retry: false }
  );
};

export const useLinodeTransferByDate = (
  id: number,
  year: string,
  month: string,
  enabled = true
) => {
  return useQuery<NetworkTransfer, APIError[]>(
    [`${queryKey}-transfer`, id, year, month],
    () => getLinodeTransferByDate(id, year, month),
    { enabled }
  );
};

/** Use with care; originally added to request all Linodes in a given region for IP sharing and transfer */
const getAllLinodesRequest = (passedParams: any = {}, passedFilter: any = {}) =>
  getAll<Linode>((params, filter) =>
    getLinodes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

const getLinodesRequest = (passedParams: any = {}, passedFilter: any = {}) =>
  getLinodes(passedParams, passedFilter).then((data) => ({
    linodes: listToItemsByID(data.data),
    results: data.results,
  }));
