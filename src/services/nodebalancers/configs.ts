import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';
import { combineConfigNodeAddressAndPort } from './utils';

import { 
  createNodeBalancerConfigSchema,
  UpdateNodeBalancerConfigSchema,
} from './nodebalancers.schema';

type Page<T> = Linode.ResourcePage<T>;
type Config = Linode.NodeBalancerConfig;

export const getNodeBalancerConfigs = (id: number) =>
Request<Page<Config>>(
  setURL(`${API_ROOT}/nodebalancers/${id}/configs`),
  setMethod('GET'),
).then(response => response.data);

export const createNodeBalancerConfig = (nodeBalancerId: number, data: any) =>
  Request<Linode.NodeBalancerConfig>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs`),
    setData(
      data,
      createNodeBalancerConfigSchema,
      combineConfigNodeAddressAndPort,
    ),
  )
    .then(response => response.data);

export const updateNodeBalancerConfig = (nodeBalancerId: number, configId: number, data: any) =>
  Request<Linode.NodeBalancerConfig>(
    setMethod('PUT'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}`),
    setData(data, UpdateNodeBalancerConfigSchema),
  )
    .then(response => response.data);

export const deleteNodeBalancerConfig = (nodeBalancerId: number, configId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}`),
  )
    .then(response => response.data);
