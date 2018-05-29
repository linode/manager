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

interface NodeBalancerUpdate {
  label?: string;
  client_conn_throttle?: number;
}

export const updateNodeBalancer = (id: number, data: NodeBalancerUpdate) => Request<NodeBalancer>(
  setURL(`${API_ROOT}/nodebalancers/${id}`),
  setMethod('PUT'),
  setData(data),
).then(response => response.data);

export const createNodeBalancer = (data: any) =>
  Request(
    setMethod('POST'),
    setURL(`${API_ROOT}/nodebalancers`),
    setData(data),
  );
