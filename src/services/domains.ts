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

export interface CreateDomainRecordDataType {
  name?: string;
  port?: number;
  priority?: number;
  protocol?: string;
  service?: string;
  tag?: string;
  target?: string;
  ttl_sec?: number;
  type?: Linode.RecordType;
  weight?: number;
}

export const createDomainRecord = (domainId: number, data: CreateDomainRecordDataType) => Request(
  setURL(`${API_ROOT}/domains/${domainId}/records`),
  setMethod('POST'),
  setData(data),
);

export interface DomainData {
  domain: string;
  type: 'master' | 'slave';
  soa_email: string;
}

export const createDomain = (data: DomainData) => Request(
  setData(data),
  setURL(`${API_ROOT}/domains`),
  setMethod('POST'),
);
