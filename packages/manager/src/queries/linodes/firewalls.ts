import {
  APIError,
  Filter,
  Firewall,
  Params,
  ResourcePage,
  getLinodeFirewalls,
} from '@linode/api-v4';
import { useQuery } from 'react-query';

import { getAll } from 'src/utilities/getAll';

import { queryPresets } from '../base';
import { queryKey } from './linodes';

export const useLinodeFirewalls = (linodeID: number) =>
  useQuery<ResourcePage<Firewall>, APIError[]>(
    [queryKey, 'linode', linodeID, 'firewalls'],
    () => getLinodeFirewalls(linodeID),
    queryPresets.oneTimeFetch
  );

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
