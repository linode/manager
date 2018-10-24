import { API_ROOT } from 'src/constants';

import Request,
{
  setData,
  setMethod,
  setParams,
  setURL,
} from '../index';

type Page<T> = Linode.ResourcePage<T>;
type Record = Linode.Record;

/**
 * Returns a paginated list of Records configured on a Domain in Linode's DNS Manager.
 *
 * @param domainId { number } The ID of the Domain we are accessing Records for.
 * @param pagination { object }
 * @param pagination.page { number }
 * @param pagination.pageSize { number }
 */
export const getDomainRecords = (domainId: number, pagination: any = {}) =>
  Request<Page<Record>>(
    setURL(`${API_ROOT}/domains/${domainId}/records`),
    setParams(pagination),
    setMethod('GET'),
  ).then(response => response.data);

/**
 * View a single Record on this Domain.
 *
 * @param domainId { number } The ID of the Domain whose Record you are accessing.
 * @param recordId { number } The ID of the Record you are accessing.
 */
export const getDomainRecord = (domainId: number, recordId: number) =>
  Request<Record>(
    setURL(`${API_ROOT}/domains/${domainId}/records/${recordId}`),
    setMethod('GET'),
  ).then(response => response.data);

/**
 * Adds a new Domain Record to the zonefile this Domain represents.
 *
 * @param domainId { number } The ID of the Domain we are accessing Records for.
 * @param data { object } Options for type, name, etc.
 */
export const createDomainRecord = (domainId: number, data: Partial<Record>) =>
  Request<Record>(
    setURL(`${API_ROOT}/domains/${domainId}/records`),
    setMethod('POST'),
    setData(data),
  ).then(response => response.data);

/**
 * Updates a single Record on this Domain.
 *
 * @param domainId { number } The ID of the Domain we are accessing Records for.
 * @param recordId { number } The ID of the Record you are accessing.
 * @param data { object } Options for type, name, etc.
 */
export const updateDomainRecord = (
  domainId: number,
  recordId: number,
  data: Partial<Record>,
  ) => Request<Record>(
    setURL(`${API_ROOT}/domains/${domainId}/records/${recordId}`),
    setMethod('PUT'),
    setData(data),
  ).then(response => response.data);

/**
 * Deletes a Record on this Domain..
 *
 * @param domainId { number } The ID of the Domain whose Record you are deleting.
 * @param recordId { number } The ID of the Record you are deleting.
 */
export const deleteDomainRecord = (domainID: number, recordId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/domains/${domainID}/records/${recordId}`),
    setMethod('DELETE'),
  ).then(response => response.data);
