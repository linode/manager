import { object, string } from 'yup';

import { API_ROOT } from 'src/constants';

import Request, { RequestStream, setData, setMethod, setParams, setURL, setXFilter, validateRequestData } from './index';

type Page<T> = Linode.ResourcePage<T>;
type Domain = Linode.Domain;
type Record = Linode.Record;

export const getDomains = (
  params: any = {},
  filters: any = {},
) => Request<Page<Domain>>(
  setURL(`${API_ROOT}/domains`),
  setMethod('GET'),
  setParams(params),
  setXFilter(filters),
)
  .then(response => response.data);;

export const getDomains$ = (
  params: any = {},
  filters: any = {},
) => {
  return RequestStream<Page<Domain>>(
    setURL(`${API_ROOT}/domains`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters),
  );
}

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
  ).then(response => response.data);

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
  setData({ status: 'active', ...data }), // remove ability for user to change status
);

export const deleteDomain = (domainID: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/domains/${domainID}`),
    setMethod('DELETE'),
  );

export const cloneDomain = (domainID: number, cloneName: string) =>
  Request<Domain>(
    setData({ domain: cloneName }),
    setURL(`${API_ROOT}/domains/${domainID}/clone`),
    setMethod('POST'),
  );

const importZoneSchema = object({
  domain: string().required(),
  remote_nameserver: string().required(),
});

export const importZone = (domain?: string, remote_nameserver?: string) =>
  Request<Domain>(
    setData({ domain, remote_nameserver }, importZoneSchema),
    setURL(`${API_ROOT}/domains/import`),
    setMethod('POST'),
  );
