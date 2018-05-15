import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod } from './index';

type Page<T> = Linode.ResourcePage<T>;
type NodeBalancer = Linode.NodeBalancer;

export const getNodeBalancersPage = (page: number) =>
  Request<Page<NodeBalancer>>(
    setURL(`${API_ROOT}/nodebalancers/?page=${page}`),
    setMethod('GET'),
  )
    .then(response => response.data);

export const getNodeBalancers = () =>
  getNodeBalancersPage(1);
