import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setParams } from './index';

type GetDomainsPage = Promise<Linode.ResourcePage<Linode.Domain>>;
export const getDomainsPage = (page: number): GetDomainsPage => Request(
    setURL(`${API_ROOT}/domains/?page=${page}`),
    setMethod('GET'),
    setParams({ page }),
  )
  .then(response => response.data);

export const getDomains = (): Promise<Linode.ResourcePage<Linode.Domain>> =>
  getDomainsPage(1);

export const getDomain = (domainId: number) => Request(
  setURL(`${API_ROOT}/domains/${domainId}`),
  setMethod('GET'),
);
