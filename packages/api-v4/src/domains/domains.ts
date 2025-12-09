import {
  createDomainSchema,
  importZoneSchema,
  updateDomainSchema,
} from '@linode/validation/lib/domains.schema';

import { API_ROOT } from '../constants';
import Request, {
  setData,
  setMethod,
  setParams,
  setURL,
  setXFilter,
} from '../request';

import type { Filter, ResourcePage as Page, Params } from '../types';
import type {
  CloneDomainPayload,
  CreateDomainPayload,
  Domain,
  ImportZonePayload,
  UpdateDomainPayload,
  ZoneFile,
} from './types';

/**
 * Returns a paginated list of Domains.
 *
 */
export const getDomains = (params?: Params, filter?: Filter) =>
  Request<Page<Domain>>(
    setURL(`${API_ROOT}/domains`),
    setMethod('GET'),
    setParams(params),
    setXFilter(filter),
  );

/**
 * Returns all of the information about a specified Domain.
 *
 * @param domainId { number } The ID of the Domain to access.
 */
export const getDomain = (domainId: number) =>
  Request<Domain>(
    setURL(`${API_ROOT}/domains/${encodeURIComponent(domainId)}`),
    setMethod('GET'),
  );

/**
 * Adds a new Domain to Linode's DNS Manager.
 *
 * @param data { object } Options for type, status, etc.
 */
export const createDomain = (data: CreateDomainPayload) =>
  Request<Domain>(
    setData(data, createDomainSchema),
    setURL(`${API_ROOT}/domains`),
    setMethod('POST'),
  );

/**
 * Update information about a Domain in Linode's DNS Manager.
 *
 * @param domainId { number } The ID of the Domain to access.
 * @param data { object } Options for type, status, etc.
 */
export const updateDomain = (domainId: number, data: UpdateDomainPayload) =>
  Request<Domain>(
    setURL(`${API_ROOT}/domains/${encodeURIComponent(domainId)}`),
    setMethod('PUT'),
    setData(data, updateDomainSchema),
  );

/**
 * Deletes a Domain from Linode's DNS Manager. The Domain will be removed from Linode's nameservers shortly after this
 * operation completes. This also deletes all associated Domain Records.
 *
 * @param domainId { number } The ID of the Domain to delete.
 */
export const deleteDomain = (domainId: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/domains/${encodeURIComponent(domainId)}`),
    setMethod('DELETE'),
  );

/**
 * Clones a Domain.
 *
 * @param domainId { number } The ID of the Domain to clone.
 * @param cloneName { string } The name of the new domain.
 */
export const cloneDomain = (domainId: number, data: CloneDomainPayload) =>
  Request<Domain>(
    setData(data),
    setURL(`${API_ROOT}/domains/${encodeURIComponent(domainId)}/clone`),
    setMethod('POST'),
  );

/**
 * Imports a domain zone from a remote nameserver.
 *
 * @param domain { string } The domain to import.
 * @param remote_nameserver { string } The remote nameserver that allows zone transfers (AXFR).
 */
export const importZone = (data: ImportZonePayload) =>
  Request<Domain>(
    setData(data, importZoneSchema),
    setURL(`${API_ROOT}/domains/import`),
    setMethod('POST'),
  );

/**
 * Download DNS Zone file.
 *
 ** @param domainId { number } The ID of the Domain to download DNS zone file.
 */
export const getDNSZoneFile = (domainId: number) =>
  Request<ZoneFile>(
    setURL(`${API_ROOT}/domains/${encodeURIComponent(domainId)}/zone-file`),
    setMethod('GET'),
  );
