import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setParams, setData } from './index';

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

export const getDomainRecords = (domainId: number) => Request(
  setURL(`${API_ROOT}/domains/${domainId}/records`),
  setMethod('GET'),
);

export const createDomainRecord = (domainId: number, data: Partial<Linode.Record>) => Request(
  setURL(`${API_ROOT}/domains/${domainId}/records`),
  setMethod('POST'),
  setData(data),
);

export const updateDomainRecord = (
  domainId: number,
  recordId: number,
  data: Partial<Linode.Record>,
) => Request(
  setURL(`${API_ROOT}/domains/${domainId}/records/${recordId}`),
  setMethod('PUT'),
  setData(data),
  );

export const deleteDomainRecord = (domainID: number, recordId: number) => Request(
  setURL(`${API_ROOT}/domains/${domainID}/records/${recordId}`),
  setMethod('DELETE'),
);

export const createDomain = (data: Partial<Linode.Domain>) => Request(
  setData(data),
  setURL(`${API_ROOT}/domains`),
  setMethod('POST'),
);

export const updateDomain = (
  domainId: number,
  data: Partial<Linode.Domain>,
) => Request(
  setURL(`${API_ROOT}/domains/${domainId}`),
  setMethod('PUT'),
  setData(data),
);

export const deleteDomain = (domainID: number) => Request(
  setURL(`${API_ROOT}/domains/${domainID}`),
  setMethod('DELETE'),
);

export const cloneDomain = (domainID: number, cloneName: string) => Request(
  setData({ domain: cloneName }),
  setURL(`${API_ROOT}/domains/${domainID}/clone`),
  setMethod('POST'),
);
