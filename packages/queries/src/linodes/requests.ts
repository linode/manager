import {
  getLinodeConfigs,
  getLinodeDisks,
  getLinodeFirewalls,
  getLinodeKernels,
  getLinodes,
  getLinodeTypes,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  Config,
  Disk,
  Filter,
  Firewall,
  Kernel,
  Linode,
  Params,
} from '@linode/api-v4';

export const getAllLinodesRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Linode>((params, filter) =>
    getLinodes({ ...params, ...passedParams }, { ...filter, ...passedFilter }),
  )().then((data) => data.data);

export const getAllLinodeKernelsRequest = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Kernel>((params, filter) =>
    getLinodeKernels(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const getAllLinodeConfigs = (id: number) =>
  getAll<Config>((params, filter) =>
    getLinodeConfigs(id, params, filter),
  )().then((data) => data.data);

export const getAllLinodeFirewalls = (
  linodeId: number,
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<Firewall>((params, filter) =>
    getLinodeFirewalls(
      linodeId,
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);

export const getAllLinodeDisks = (id: number) =>
  getAll<Disk>((params, filter) => getLinodeDisks(id, params, filter))().then(
    (data) => data.data,
  );

export const getAllLinodeTypes = () =>
  getAll(getLinodeTypes)().then((results) => results.data);
