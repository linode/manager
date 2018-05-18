import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setParams } from './index';

type Page<T> = Linode.ResourcePage<T>;
type NodeBalancer = Linode.NodeBalancer;

export const getNodeBalancersPage = (page: number) =>
  Request<Page<NodeBalancer>>(
    setURL(`${API_ROOT}/nodebalancers/`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

export const getNodeBalancers = () => {
  return getNodeBalancersPage(1)
    .then(response => response.data);
};

export const getNodeBalancerConfigs = (id: number) => Request(
  setURL(`${API_ROOT}/nodebalancers/${id}/configs`),
  setMethod('GET'),
).then(response => response.data);
