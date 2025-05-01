import { getIPs, getIPv6Ranges } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { Filter, IPAddress, IPRange, Params } from '@linode/api-v4';

export const getAllIps = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<IPAddress>((params, filter) =>
    getIPs({ ...params, ...passedParams }, { ...filter, ...passedFilter }),
  )().then((data) => data.data);

export const getAllIPv6Ranges = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<IPRange>((params, filter) =>
    getIPv6Ranges(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);
