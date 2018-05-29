import * as Joi from 'joi';
import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setParams, setData, validateRequestData } from './index';

type Page<T> = Linode.ResourcePage<T>;
type NodeBalancer = Linode.NodeBalancer;
type Config = Linode.NodeBalancerConfig;

export const getNodeBalancersPage = (page: number) =>
  Request<Page<NodeBalancer>>(
    setURL(`${API_ROOT}/nodebalancers/`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

export const getNodeBalancers = () =>
  getNodeBalancersPage(1)
    .then(response => response.data);

export const getNodeBalancerConfigs = (id: number) =>
  Request<Page<Config>>(
    setURL(`${API_ROOT}/nodebalancers/${id}/configs`),
    setMethod('GET'),
  ).then(response => response.data);

export const getNodeBalancer = (id: number) => Request<NodeBalancer>(
  setURL(`${API_ROOT}/nodebalancers/${id}`),
  setMethod('GET'),
).then(response => response.data);

export const updateNodeBalancer = (id: number, label: string) => Request<NodeBalancer>(
  setURL(`${API_ROOT}/nodebalancers/${id}`),
  setMethod('PUT'),
  setData({ label }),
).then(response => response.data);

const createNodeBalancerSchema = Joi.object({
  region: Joi.string().required(),
});

export const createNodeBalancer = (data: any) =>
  Request<Linode.NodeBalancer>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers`),
    setData(data),
    validateRequestData(data, createNodeBalancerSchema),
  )
    .then(response => response.data);

export const createNodeBalancerConfig = (nodeBalancerId: number, data: any) =>
  Request<Linode.NodeBalancerConfig>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs`),
    setData(data),
  )
    .then(response => response.data);
