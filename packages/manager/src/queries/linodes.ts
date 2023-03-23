import { NetworkTransfer } from '@linode/api-v4/lib/account/types';
import { useInfiniteQuery, useQuery } from 'react-query';
import {
  APIError,
  Filter,
  Params,
  ResourcePage,
} from '@linode/api-v4/lib/types';
import { getAll } from 'src/utilities/getAll';
import { listToItemsByID, queryPresets } from './base';
import { parseAPIDate } from 'src/utilities/date';
import { DateTime } from 'luxon';
import { Firewall } from '@linode/api-v4';
import {
  Linode,
  getLinodes,
  getLinodeStatsByDate,
  Stats,
  getLinodeTransferByDate,
  getLinodeStats,
  getLinode,
  getLinodeLishToken,
  getLinodeConfigs,
  Config,
  getLinodeFirewalls,
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
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<ResourcePage<Linode>, APIError[]>(
    [queryKey, params, filter],
    () => getLinodes(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

// @todo get rid of "byId". It adds yet another manipulation of API that a dev must understand
export const useLinodesByIdQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<LinodeData, APIError[]>(
    [queryKey, params, filter],
    () => getLinodesRequest(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

export const useAllLinodesQuery = (
  params: Params = {},
  filter: Filter = {},
  enabled: boolean = true
) => {
  return useQuery<Linode[], APIError[]>(
    [`${queryKey}-all`, params, filter],
    () => getAllLinodesRequest(params, filter),
    { ...queryPresets.longLived, enabled }
  );
};

export const useInfiniteLinodesQuery = (filter: Filter) =>
  useInfiniteQuery<ResourcePage<Linode>, APIError[]>(
    [queryKey, filter],
    ({ pageParam }) => getLinodes({ page: pageParam, page_size: 25 }, filter),
    {
      getNextPageParam: ({ page, pages }) => {
        if (page === pages) {
          return undefined;
        }
        return page + 1;
      },
    }
  );

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
    [queryKey, id, 'stats'],
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
    [queryKey, id, 'stats', 'date', year, month],
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
    [queryKey, id, 'transfer', year, month],
    () => getLinodeTransferByDate(id, year, month),
    { enabled }
  );
};

export const useLinodeQuery = (id: number, enabled = true) => {
  return useQuery<Linode, APIError[]>([queryKey, id], () => getLinode(id), {
    enabled,
  });
};

export const useAllLinodeConfigsQuery = (id: number, enabled = true) => {
  return useQuery<Config[], APIError[]>(
    [queryKey, id, 'configs'],
    () => getAllLinodeConfigs(id),
    { enabled }
  );
};

export const useLinodeLishTokenQuery = (id: number) => {
  return useQuery<{ lish_token: string }, APIError[]>(
    [queryKey, id, 'lish-token'],
    () => getLinodeLishToken(id),
    { staleTime: Infinity }
  );
};

export const useLinodeFirewalls = (linodeID: number) =>
  useQuery<ResourcePage<Firewall>, APIError[]>(
    [queryKey, linodeID, 'firewalls'],
    () => getLinodeFirewalls(linodeID),
    queryPresets.oneTimeFetch
  );

/** Use with care; originally added to request all Linodes in a given region for IP sharing and transfer */
const getAllLinodesRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Linode>((params, filter) =>
    getLinodes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

const getLinodesRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getLinodes(passedParams, passedFilter).then((data) => ({
    linodes: listToItemsByID(data.data),
    results: data.results,
  }));

const getAllLinodeConfigs = (id: number) =>
  getAll<Config>((params, filter) =>
    getLinodeConfigs(id, params, filter)
  )().then((data) => data.data);

export const getAllLinodeFirewalls = (
  linodeId: number,
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Firewall>((params, filter) =>
    getLinodeFirewalls(
      linodeId,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);
