import { API_ROOT } from 'src/constants';
import Request, { setURL, setMethod, setParams, setData } from './index';

type Page<T> = Linode.ResourcePage<T>;
type Domain = Linode.Domain;
type Record = Linode.Record;

export const getDomainsPage = (page: number) =>
  Request<Page<Domain>>(
    setURL(`${API_ROOT}/domains/?page=${page}`),
    setMethod('GET'),
    setParams({ page }),
  )
    .then(response => response.data);

export const getDomains = () =>
  getDomainsPage(1);

export const getDomain = (domainId: number) =>
  Request<Domain>(
    setURL(`${API_ROOT}/domains/${domainId}`),
    setMethod('GET'),
  );

export const getDomainRecords = (domainId: number) =>
  Request<Page<Record>>(
    setURL(`${API_ROOT}/domains/${domainId}/records`),
    setMethod('GET'),
  );

export const createDomainRecord = (domainId: number, data: Partial<Linode.Record>) =>
  Request<Record>(
    setURL(`${API_ROOT}/domains/${domainId}/records`),
    setMethod('POST'),
    setData(data),
  );

export const updateDomainRecord = (
  domainId: number,
  recordId: number,
  data: Partial<Linode.Record>,
) => Request<Record>(
  setURL(`${API_ROOT}/domains/${domainId}/records/${recordId}`),
  setMethod('PUT'),
  setData(data),
  );

export const deleteDomainRecord = (domainID: number, recordId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/domains/${domainID}/records/${recordId}`),
    setMethod('DELETE'),
  );

export const createDomain = (data: Partial<Linode.Domain>) =>
  Request<Domain>(
  setData(data),
  setURL(`${API_ROOT}/domains`),
  setMethod('POST'),
);

export const updateDomain = (
  domainId: number,
  data: Partial<Linode.Domain>,
) => Request<Domain>(
  setURL(`${API_ROOT}/domains/${domainId}`),
  setMethod('PUT'),
  setData(data),
  );

export const deleteDomain = (domainID: number) =>
  Request<{}>(
  setURL(`${API_ROOT}/domains/${domainID}`),
  setMethod('DELETE'),
);

export const cloneDomain = (domainID: number, cloneName: string) =>
  Request(
  setData({ domain: cloneName }),
  setURL(`${API_ROOT}/domains/${domainID}/clone`),
  setMethod('POST'),
);
