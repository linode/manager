import {
  getIPs,
  getIPv6Ranges,
  getLinodeConfigs,
  getLinodeFirewalls,
  getLinodeKernels,
  getLinodes,
} from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

import type {
  Config,
  Filter,
  Firewall,
  IPAddress,
  IPRange,
  Kernel,
  Linode,
  Params,
} from '@linode/api-v4';

export const getAllLinodesRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Linode>((params, filter) =>
    getLinodes({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const getAllLinodeKernelsRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Kernel>((params, filter) =>
    getLinodeKernels(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);

export const getAllLinodeConfigs = (id: number) =>
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

export const getAllIps = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<IPAddress>((params, filter) =>
    getIPs({ ...params, ...passedParams }, { ...filter, ...passedFilter })
  )().then((data) => data.data);

export const getAllIPv6Ranges = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<IPRange>((params, filter) =>
    getIPv6Ranges(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);
