import { API_ROOT } from 'src/constants';

import Request,
{
  setData,
  setMethod,
  setURL,
} from '../index';

type Page<T> = Linode.ResourcePage<T>;
type Record = Linode.Record;

export const getDomainRecords = (domainId: number) =>
Request<Page<Record>>(
  setURL(`${API_ROOT}/domains/${domainId}/records`),
  setMethod('GET'),
);

export const createDomainRecord = (domainId: number, data: Partial<Record>) =>
Request<Record>(
  setURL(`${API_ROOT}/domains/${domainId}/records`),
  setMethod('POST'),
  setData(data),
).then(response => response.data);

export const updateDomainRecord = (
domainId: number,
recordId: number,
data: Partial<Record>,
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
