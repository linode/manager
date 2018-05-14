import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod } from './index';

type GetNodeBalancersPage = Promise<Linode.ResourcePage<Linode.NodeBalancer>>;
export const getNodeBalancersPage = (page: number): GetNodeBalancersPage =>
  Request(
    setURL(`${API_ROOT}/nodebalancers/?page=${page}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getNodeBalancers = (): GetNodeBalancersPage =>
  getNodeBalancersPage(1);
