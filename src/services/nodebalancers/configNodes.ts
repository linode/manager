import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setURL } from '../index';

import { 
  nodeBalancerConfigNodeSchema,
} from './nodebalancers.schema';
import { mergeAddressAndPort } from './utils';

type Page<T> = Linode.ResourcePage<T>;

export const getNodeBalancerConfigNodes = (
  nodeBalancerId: number,
  configId: number,
) =>
  Request<Page<Linode.NodeBalancerConfigNode>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes`),
  )
    .then(response => response.data);

    export const createNodeBalancerConfigNode = (
      nodeBalancerId: number,
      configId: number,
      data: any,
    ) =>
      Request<Linode.NodeBalancerConfigNode>(
        setMethod('POST'),
        setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes`),
        setData(
          data,
          nodeBalancerConfigNodeSchema,
          mergeAddressAndPort,
        ),
      )
        .then(response => response.data);
    
    export const updateNodeBalancerConfigNode = (
      nodeBalancerId: number,
      configId: number,
      nodeId: number,
      data: any,
    ) =>
      Request<Linode.NodeBalancerConfigNode>(
        setMethod('PUT'),
        setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes/${nodeId}`),
        setData(
          data,
          nodeBalancerConfigNodeSchema,
          mergeAddressAndPort,
        ),
      )
        .then(response => response.data);
    
    export const deleteNodeBalancerConfigNode = (
      nodeBalancerId: number,
      configId: number,
      nodeId: number,
    ) =>
      Request<Linode.NodeBalancerConfigNode>(
        setMethod('DELETE'),
        setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes/${nodeId}`),
      )
        .then(response => response.data);