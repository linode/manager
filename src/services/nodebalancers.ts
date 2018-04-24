import Axios from 'axios';
import { API_ROOT } from 'src/constants';

type GetNodeBalancersPage = Promise<Linode.ResourcePage<Linode.NodeBalancer>>;
export const getNodeBalancersPage = (page: number): GetNodeBalancersPage =>
  Axios
    .get(`${API_ROOT}/nodebalancers/?page=${page}`)
    .then(response => response.data);

export const getNodeBalancers = (): Promise<Linode.ResourcePage<Linode.NodeBalancer>> =>
  getNodeBalancersPage(1);
