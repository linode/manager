import { NetworkTransfer } from '@linode/api-v4/lib/account/types';
import { APIError, ResourcePage } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
import { getAll } from 'src/utilities/getAll';
import { listToItemsByID, queryPresets } from './base';
import { parseAPIDate } from 'src/utilities/date';
import { DateTime } from 'luxon';
import {
  Linode,
  getLinodes,
  getLinodeStatsByDate,
  Stats,
  getLinodeTransferByDate,
  getLinodeStats,
  getLinode,
  getLinodeLishToken,
} from '@linode/api-v4/lib/linodes';

export const STATS_NOT_READY_API_MESSAGE =
  'Stats are unavailable at this time.';
export const STATS_NOT_READY_MESSAGE =
  'Stats for this Linode are not available yet';

export const queryKey = 'linode';

interface LinodeData {
  results: number;
  linodes: Record<string, Linode>;
}

export const useLinodesQuery = (
  params: any = {},
  filter: any = {},
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<Linode>, APIError[]>(
    [queryKey, params, filter],
    () => getLinodes(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

export const useLinodesByIdQuery = (
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

  return parseAPIDate(linodeCreated) > DateTime.local().minus({ minutes: 7 });
};

export const useLinodeStats = (
  id: number,
  enabled = true,
  linodeCreated?: string
) => {
  return useQuery<Stats, APIError[]>(
    [`${queryKey}-stats`, id],
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
    [`${queryKey}-stats-date`, id, year, month],
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
    [`${queryKey}-transfer`, id, year, month],
    () => getLinodeTransferByDate(id, year, month),
    { enabled }
  );
};

export const useLinodeQuery = (id: number) => {
  return useQuery<Linode, APIError[]>([queryKey, id], () => getLinode(id));
};

export const useLinodeLishTokenQuery = (id: number) => {
  return useQuery<{ lish_token: string }, APIError[]>(
    [`${queryKey}-lish-token`, id],
    () => getLinodeLishToken(id),
    { staleTime: Infinity }
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
