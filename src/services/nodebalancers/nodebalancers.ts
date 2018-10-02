import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from '../index';

import {
  NodeBalancerSchema,
  UpdateNodeBalancerSchema,
} from './nodebalancers.schema';
import { combineNodeBalancerConfigNodeAddressAndPort } from './utils';

type Page<T> = Linode.ResourcePage<T>;
type NodeBalancer = Linode.NodeBalancer;

/** Requests */
export const getNodeBalancers = (pagination: any = {}, filters: any = {}) =>
  Request<Page<NodeBalancer>>(
    setURL(`${API_ROOT}/nodebalancers/`),
    setMethod('GET'),
    setParams(pagination),
    setXFilter(filters),
  )
    .then(response => response.data);

export const getNodeBalancer = (id: number) => Request<NodeBalancer>(
  setURL(`${API_ROOT}/nodebalancers/${id}`),
  setMethod('GET'),
).then(response => response.data);

export const updateNodeBalancer = (id: number, data: Partial<NodeBalancer>) =>
  Request<NodeBalancer>(
    setURL(`${API_ROOT}/nodebalancers/${id}`),
    setMethod('PUT'),
    setData(data, UpdateNodeBalancerSchema),
  ).then(response => response.data);

export const createNodeBalancer = (data: any) =>
  Request<Linode.NodeBalancer>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers`),
    setData(
      data,
      NodeBalancerSchema,
      combineNodeBalancerConfigNodeAddressAndPort,
    ),
  )
    .then(response => response.data);

export const deleteNodeBalancer = (id: number) => Request<NodeBalancer>(
  setMethod('DELETE'),
  setURL(`${API_ROOT}/nodebalancers/${id}`),
).then(response => response.data);

export const getNodeBalancerStats = (nodeBalancerId: number, month?: string, year?: string) => {
  const endpoint = (year && month)
    ? `${API_ROOT}/nodebalancers/${nodeBalancerId}/stats/${year}/${month}`
    : `${API_ROOT}/nodebalancers/${nodeBalancerId}/stats`;
  return Request(
    setURL(endpoint),
    setMethod('GET'),
  ).then(response => response.data);
};
