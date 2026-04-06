import {
  getNodeBalancerConfigs,
  getNodeBalancers,
  getNodeBalancerTypes,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  Filter,
  NodeBalancer,
  NodeBalancerConfig,
  Params,
  PriceType,
} from '@linode/api-v4';

export const getAllNodeBalancerTypes = () =>
  getAll<PriceType>((params) => getNodeBalancerTypes(params))().then(
    (results) => results.data,
  );

export const getAllNodeBalancerConfigs = (id: number) =>
  getAll<NodeBalancerConfig>((params) =>
    getNodeBalancerConfigs(id, params),
  )().then((data) => data.data);

export const getAllNodeBalancers = (
  passedParams: Params = {},
  passedFilter: Filter = {},
) =>
  getAll<NodeBalancer>((params, filter) =>
    getNodeBalancers(
      { ...params, ...passedParams },
      { ...filter, ...passedFilter },
    ),
  )().then((data) => data.data);
