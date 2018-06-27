import * as Joi from 'joi';
import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setParams, setData } from './index';

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

export const updateNodeBalancer = (id: number, data: Partial<NodeBalancer>) =>
  Request<NodeBalancer>(
    setURL(`${API_ROOT}/nodebalancers/${id}`),
    setMethod('PUT'),
    setData(data),
  ).then(response => response.data);

export const createNodeBalancerConfigNodeSchema = Joi.object({
  label: Joi.string().min(3).max(32).required(),
  address: Joi.string().regex(/^192\.168\.\d{1,3}\.\d{1,3}$/).required(),
  port: Joi.string().regex(/^\d{1,5}$/).required(),
  weight: Joi.number().min(1).max(255),
  mode: Joi.valid('accept', 'reject', 'drain'),
});

export const createNodeBalancerConfigNode = (
  nodeBalancerId: number,
  configId: number,
  data: any,
) =>
  Request<Linode.NodeBalancerConfigNode>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes`),
    setData(data),
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
    setData(data),
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

export const getNodeBalancerConfigNodes = (
  nodeBalancerId: number,
  configId: number,
) =>
  Request<Page<Linode.NodeBalancerConfigNode>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes`),
  )
    .then(response => response.data);

export const createNodeBalancerConfigSchema = Joi.object({
  algorithm: Joi.string(),
  check_attempts: Joi.number(),
  check_body: Joi.string()
    .when('check', { is: 'http_body', then: Joi.required() }),
  check_interval: Joi.number(),
  check_passive: Joi.bool(),
  check_path: Joi.string().regex(/\/.+/)
    .when('check', { is: 'http', then: Joi.required() })
    .when('check', { is: 'http_body', then: Joi.required() }),
  check_timeout: Joi.number().integer(),
  check: Joi.string(),
  cipher_suite: Joi.string(),
  port: Joi.number().integer().min(1).max(65535).required(),
  protocol: Joi.valid('http', 'https', 'tcp'),
  ssl_key: Joi.string().when('protocol', { is: 'https', then: Joi.required() }),
  ssl_cert: Joi.string().when('protocol', { is: 'https', then: Joi.required() }),
  stickiness: Joi.string(),
  nodes: Joi.array()
    .items(createNodeBalancerConfigNodeSchema).required().min(1),
});

export const createNodeBalancerConfig = (nodeBalancerId: number, data: any) =>
  Request<Linode.NodeBalancerConfig>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs`),
    setData(data),
  )
    .then(response => response.data);

export const updateNodeBalancerConfig = (nodeBalancerId: number, configId: number, data: any) =>
  Request<Linode.NodeBalancerConfig>(
    setMethod('PUT'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}`),
    setData(data),
  )
    .then(response => response.data);

export const deleteNodeBalancerConfig = (nodeBalancerId: number, configId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}`),
  )
    .then(response => response.data);

export const createNodeBalancerSchema = Joi.object({
  label: Joi.string().regex(/^[a-zA-Z0-9-_]+$/).min(3).max(32),
  client_conn_throttle: Joi.number(),
  region: Joi.string().required(),
  configs: Joi.array()
    .items(createNodeBalancerConfigSchema)
    .unique((a, b) => a.port === b.port),
});

export const createNodeBalancer = (data: any) =>
  Request<Linode.NodeBalancer>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers`),
    setData(data),
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
