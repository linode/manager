import Axios from 'axios';
import { API_ROOT } from 'src/constants';

type GetDomainsPage = Promise<Linode.ManyResourceState<Linode.Domain>>;
export const getDomainsPage = (page: number): GetDomainsPage =>
  Axios
    .get(`${API_ROOT}/domains/?page=${page}`)
    .then(response => response.data);

export const getDomains = (): Promise<Linode.ManyResourceState<Linode.Domain>> =>
  getDomainsPage(1);
