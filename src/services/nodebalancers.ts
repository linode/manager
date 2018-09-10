import { array, boolean, number, object, string } from 'yup';

import { API_ROOT } from 'src/constants';

import Request, { setData, setMethod, setParams, setURL, setXFilter } from './index';

type Page<T> = Linode.ResourcePage<T>;
type NodeBalancer = Linode.NodeBalancer;
type Config = Linode.NodeBalancerConfig;



/** Helpers */
const mergeAddressAndPort = (node: Linode.NodeBalancerConfigNode) => ({
  ...node,
  address: `${node.address}:${node.port}`,
});



/** Schemas */
export const nodeBalancerConfigNodeSchema = object().shape({
  label: string()
    .min(3, 'Label should be between 3 and 32 characters.')
    .max(32, 'Label should be between 3 and 32 characters.')
    .required('Label is required.'),

  address: string()
    .matches(/^192\.168\.\d{1,3}\.\d{1,3}$/, 'Must be a valid IPv4 address.')
    .required('IP address is required.'),

  port: string()
    .matches(/^\d{1,5}$/)
    .required('Port is required.'),

  weight: number()
    .min(1, `Weight must be between 1 and 255.`)
    .max(255, `Weight must be between 1 and 255.`),

  mode: string()
    .oneOf(['accept', 'reject', 'drain'])
});

export const createNodeBalancerConfigSchema = object().shape({
  algorithm: string(),
  check_attempts: number(),
  check_body: string()
    .when('check', { is: 'http_body', then: string().required() }),
  check_interval: number(),
  check_passive: boolean(),
  check_path: string().matches(/\/.*/)
    .when('check', { is: 'http', then: string().required() })
    .when('check', { is: 'http_body', then: string().required() }),
  check_timeout: number().integer(),
  check: string(),
  cipher_suite: string(),
  port: number().integer().min(1).max(65535).required(),
  protocol: string().oneOf(['http', 'https', 'tcp']),
  ssl_key: string().when('protocol', { is: 'https', then: string().required() }),
  ssl_cert: string().when('protocol', { is: 'https', then: string().required() }),
  stickiness: string(),
  nodes: array()
    .of(nodeBalancerConfigNodeSchema).required().min(1),
});



/** Requests */
export const getNodeBalancers = (pagination: any = {}, filters: any = {}) =>
  Request<Page<NodeBalancer>>(
    setURL(`${API_ROOT}/nodebalancers/`),
    setMethod('GET'),
    setParams(pagination),
    setXFilter(filters),
  )
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
    setData(data, NodeBalancerSchema),
  ).then(response => response.data);

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

export const getNodeBalancerConfigNodes = (
  nodeBalancerId: number,
  configId: number,
) =>
  Request<Page<Linode.NodeBalancerConfigNode>>(
    setMethod('GET'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}/nodes`),
  )
    .then(response => response.data);

export const combineConfigNodeAddressAndPort = (data: any) => ({
  ...data,
  nodes: data.nodes.map((n: any) => ({
    address: `${n.address}:${n.port}`,
    label: n.label,
    mode: n.mode,
    weight: n.weight,
  })),
});

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
    setData(data, nodeBalancerConfigNodeSchema),
  )
    .then(response => response.data);

export const deleteNodeBalancerConfig = (nodeBalancerId: number, configId: number) =>
  Request<{}>(
    setMethod('DELETE'),
    setURL(`${API_ROOT}/nodebalancers/${nodeBalancerId}/configs/${configId}`),
  )
    .then(response => response.data);

export const NodeBalancerSchema = object({
  label: string()
    .matches(/^[a-zA-Z0-9-_]+$/)
    .min(3)
    .max(32),

  client_conn_throttle: number(),

  region: string().required('Region is required.'),

  configs: array()
    .of(createNodeBalancerConfigSchema)
  /** How do I do unique... */
  // .unique((a, b) => a.port === b.port),
});

export const combineNodeBalancerConfigNodeAddressAndPort = (data: any) => ({
  ...data,
  configs: data.configs
    .map((c: any) => ({
      ...c,
      nodes: c.nodes.map((n: any) => ({
        address: `${n.address}:${n.port}`,
        label: n.label,
        mode: n.mode,
        weight: n.weight,
      })),
    }))
});

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
