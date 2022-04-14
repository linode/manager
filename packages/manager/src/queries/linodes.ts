import { NetworkTransfer } from '@linode/api-v4/lib/account/types';
import { APIError } from '@linode/api-v4/lib/types';
import { useQuery } from 'react-query';
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

export const useLinodeNetworkStatsByDate = (
  id: number,
  year: string,
  month: string,
  enabled = true
) => {
  return useQuery<Stats, APIError[]>(
    [`${queryKey}-stats`, id, year, month],
    () => getLinodeStatsByDate(id, year, month),
    // We need to disable retries because the API will
    // error if stats are not ready. If the default retry policy
    // is used, a "stats not ready" state can't be shown because the
    // query is still trying to request.
    { enabled, retry: false }
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
