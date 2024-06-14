import { Filter, Loadbalancer, Params, getLoadbalancers } from '@linode/api-v4';

import { getAll } from 'src/utilities/getAll';

export const getAllLoadbalancers = (
  passedParams: Params = {},
  passedFilter: Filter = {}
) =>
  getAll<Loadbalancer>((params, filter) =>
    getLoadbalancers(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter }
    )
  )().then((data) => data.data);
