import {
  createRecordSchema,
  updateRecordSchema,
} from '@linode/validation/lib/records.schema';

import { API_ROOT } from '../constants';
import Request, { setData, setMethod, setParams, setURL } from '../request';

import type { ResourcePage as Page, Params } from '../types';
import type { DomainRecord } from './types';

/**
 * Returns a paginated list of Records configured on a Domain in Linode's DNS Manager.
 *
 * @param domainId { number } The ID of the Domain we are accessing Records for.
 * @param params { object }
 */
export const getDomainRecords = (domainId: number, params?: Params) =>
  Request<Page<DomainRecord>>(
    setURL(`${API_ROOT}/domains/${encodeURIComponent(domainId)}/records`),
    setParams(params),
    setMethod('GET'),
  );

/**
 * View a single Record on this Domain.
 *
 * @param domainId { number } The ID of the Domain whose Record you are accessing.
 * @param recordId { number } The ID of the Record you are accessing.
 */
export const getDomainRecord = (domainId: number, recordId: number) =>
  Request<DomainRecord>(
    setURL(
      `${API_ROOT}/domains/${encodeURIComponent(
        domainId,
      )}/records/${encodeURIComponent(recordId)}`,
    ),
    setMethod('GET'),
  );

/**
 * Adds a new Domain Record to the zonefile this Domain represents.
 *
 * @param domainId { number } The ID of the Domain we are accessing Records for.
 * @param data { object } Options for type, name, etc.
 */
export const createDomainRecord = (
  domainId: number,
  data: Partial<DomainRecord>,
) =>
  Request<DomainRecord>(
    setURL(`${API_ROOT}/domains/${encodeURIComponent(domainId)}/records`),
    setMethod('POST'),
    setData(data, createRecordSchema),
  );

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
  data: Partial<DomainRecord>,
) =>
  Request<DomainRecord>(
    setURL(
      `${API_ROOT}/domains/${encodeURIComponent(
        domainId,
      )}/records/${encodeURIComponent(recordId)}`,
    ),
    setMethod('PUT'),
    setData(data, updateRecordSchema),
  );

/**
 * Deletes a Record on this Domain..
 *
 * @param domainId { number } The ID of the Domain whose Record you are deleting.
 * @param recordId { number } The ID of the Record you are deleting.
 */
export const deleteDomainRecord = (domainId: number, recordId: number) =>
  Request<{}>(
    setURL(
      `${API_ROOT}/domains/${encodeURIComponent(
        domainId,
      )}/records/${encodeURIComponent(recordId)}`,
    ),
    setMethod('DELETE'),
  );
