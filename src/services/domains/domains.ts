import { API_ROOT } from 'src/constants';

import Request,
{
  CancellableRequest,
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../index';

import { importZoneSchema } from './domains.schema';

type Page<T> = Linode.ResourcePage<T>;
type Domain = Linode.Domain;

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
  return CancellableRequest<Page<Domain>>(
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

export const importZone = (domain?: string, remote_nameserver?: string) =>
  Request<Domain>(
    setData({ domain, remote_nameserver }, importZoneSchema),
    setURL(`${API_ROOT}/domains/import`),
    setMethod('POST'),
  );
