import {
  getNodeBalancerConfigs,
  getNodeBalancers,
  getNodeBalancerTypes,
} from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type {
  NodeBalancer,
  NodeBalancerConfig,
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

export const getAllNodeBalancers = () =>
  getAll<NodeBalancer>((params) => getNodeBalancers(params))().then(
    (data) => data.data,
  );
