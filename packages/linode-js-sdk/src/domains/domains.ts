import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter
} from '../request';
import {
  createDomainSchema,
  importZoneSchema,
  updateDomainSchema
} from './domains.schema';

import { ResourcePage as Page } from '../types';
import { Domain } from './types';

/**
 * Returns a paginated list of Domains.
 *
 */
export const getDomains = (params?: any, filters?: any) =>
  Request<Page<Domain>>(
    setURL(`${API_ROOT}/domains`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filters)
  ).then(response => response.data);

/**
 * Returns all of the information about a specified Domain.
 *
 * @param domainId { number } The ID of the Domain to access.
 */
export const getDomain = (domainId: number) =>
  Request<Domain>(
    setURL(`${API_ROOT}/domains/${domainId}`),
    setMethod('GET')
  ).then(response => response.data);

/**
 * Adds a new Domain to Linode's DNS Manager.
 *
 * @param data { object } Options for type, status, etc.
 */
export const createDomain = (data: Partial<Domain>) =>
  Request<Domain>(
    setData(data, createDomainSchema),
    setURL(`${API_ROOT}/domains`),
    setMethod('POST')
  ).then(response => response.data);

/**
 * Update information about a Domain in Linode's DNS Manager.
 *
 * @param domainId { number } The ID of the Domain to access.
 * @param data { object } Options for type, status, etc.
 */
export const updateDomain = (domainId: number, data: Partial<Domain>) =>
  Request<Domain>(
    setURL(`${API_ROOT}/domains/${domainId}`),
    setMethod('PUT'),
    setData(data, updateDomainSchema)
  ).then(response => response.data);

/**
 * Deletes a Domain from Linode's DNS Manager. The Domain will be removed from Linode's nameservers shortly after this
 * operation completes. This also deletes all associated Domain Records.
 *
 * @param domainId { number } The ID of the Domain to delete.
 */
export const deleteDomain = (domainId: number) =>
  Request<{}>(setURL(`${API_ROOT}/domains/${domainId}`), setMethod('DELETE'));

/**
 * Clones a Domain.
 *
 * @param domainId { number } The ID of the Domain to clone.
 * @param cloneName { string } The name of the new domain.
 */
export const cloneDomain = (domainId: number, cloneName: string) =>
  Request<Domain>(
    setData({ domain: cloneName }),
    setURL(`${API_ROOT}/domains/${domainId}/clone`),
    setMethod('POST')
  ).then(response => response.data);

/**
 * Imports a domain zone from a remote nameserver.
 *
 * @param domain { string } The domain to import.
 * @param remote_nameserver { string } The remote nameserver that allows zone transfers (AXFR).
 */
export const importZone = (domain: string, remote_nameserver: string) =>
  Request<Domain>(
    setData({ domain, remote_nameserver }, importZoneSchema),
    setURL(`${API_ROOT}/domains/import`),
    setMethod('POST')
  ).then(response => response.data);
