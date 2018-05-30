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

export const updateNodeBalancer = (id: number, data: Partial<NodeBalancer>) =>
  Request<NodeBalancer>(
    setURL(`${API_ROOT}/nodebalancers/${id}`),
    setMethod('PUT'),
    setData(data),
  ).then(response => response.data);

export const createNodeBalancerConfigNodeSchema = Joi.object({
  label: Joi.string().min(3).max(32).required(),
  address: Joi.string().regex(/^192\.168\.\d{1,3}\.\d{1,3}:[0-9]+$/).required(),
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


export const createNodeBalancerConfigSchema = Joi.object({
  algorithm: Joi.string(),
  check_attempts: Joi.number(),
  check_body: Joi.string()
    .when('check', { is: 'http_body', then: Joi.required() }),
  check_interval: Joi.number(),
  check_passive: Joi.bool(),
  check_path: Joi.string()
    .when('check', { is: 'http', then: Joi.required() })
    .when('check', { is: 'http_body', then: Joi.required() }),
  check_timeout: Joi.number(),
  check: Joi.string(),
  cipher_suite: Joi.string(),
  port: Joi.number(),
  protocol: Joi.valid('http', 'https'),
  ssl_key: Joi.string().when('protocol', { is: 'https', then: Joi.required() }),
  ssl_cert: Joi.string().when('protocol', { is: 'https', then: Joi.required() }),
  stickiness: Joi.string(),
  nodes: Joi.array()
    .items(createNodeBalancerConfigNodeSchema),
});

export const createNodeBalancerConfig = (nodeBalancerId: number, data: any) =>
  Request<Linode.NodeBalancerConfig>(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs`),
    setData(data),
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
    validateRequestData(data, createNodeBalancerSchema),
  )
    .then(response => response.data);

export const getNodeBalancerStats = (nodeBalancerId: number, month?: string, year?: string) => {
  const endpoint = (year && month)
    ? `${API_ROOT}/nodebalancers/${nodeBalancerId}/stats/${year}/${month}`
    : `${API_ROOT}/nodebalancers/${nodeBalancerId}/stats`;
  return Request(
    setURL(endpoint),
    setMethod('GET'),
  ).then(response => response.data);
};
