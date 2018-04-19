import Axios from 'axios';
import { API_ROOT } from 'src/constants';

type GetNodeBalancersPage = Promise<Linode.ManyResourceState<Linode.NodeBalancer>>;
export const getNodeBalancersPage = (page: number): GetNodeBalancersPage =>
  Axios
    .get(`${API_ROOT}/nodebalancers/?page=${page}`)
    .then(response => response.data);

export const getNodeBalancers = (): Promise<Linode.ManyResourceState<Linode.NodeBalancer>> =>
  getNodeBalancersPage(1);
