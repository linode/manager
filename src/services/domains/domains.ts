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

/**
 * Returns a paginated list of Domains.
 *
 * @param pagination { object }
 * @param pagination.page { number }
 * @param pagination.pageSize { number }
 * @param filters { object }
 */
export const getDomains = (pagination: any = {}, filters: any = {}) =>
  Request<Page<Domain>>(
    setURL(`${API_ROOT}/domains`),
    setMethod('GET'),
    setParams(pagination),
    setXFilter(filters),
  )
  .then(response => response.data);

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

/**
 * Returns all of the information about a specified Domain.
 *
 * @param domainId { number } ID of the Image to look up.
 */
export const getDomain = (domainId: number) =>
  Request<Domain>(
    setURL(`${API_ROOT}/domains/${domainId}`),
    setMethod('GET'),
  );

/**
 * Adds a new Domain to Linode's DNS Manager.
 *
 * @param data { object }
 * @param data.domain { string } The domain this Domain represents.
 * @param data.type { string } If this Domain represents the authoritative source of information for the domain it
 * describes, or if it is a read-only copy of a master (also called a slave).
 * @param data.status { string } Used to control whether this Domain is currently being rendered.
 * @param data.description { string } A description for this Domain. This is for display purposes only.
 * @param data.ttl_sec { number } "Time to Live" - the amount of time in seconds that this Domain's records may be
 * cached by resolvers or other domain servers. Valid values are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800,
 * 345600, 604800, 1209600, and 2419200 - any other value will be rounded to the nearest valid value.
 * @param data.retry_sec { number } The interval, in seconds, at which a failed refresh should be retried. Valid values
 * are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800, 345600, 604800, 1209600, and 2419200 - any other value
 * will be rounded to the nearest valid value.
 * @param data.master_ips { number } The IP addresses representing the master DNS for this Domain.
 * @param data.axfr_ips { string[] } The list of IPs that may perform a zone transfer for this Domain. This is
 * potentially dangerous, and should be set to an empty list unless you intend to use it.
 * @param data.expire_sec { number } The amount of time in seconds that may pass before this Domain is no longer
 * authoritative. Valid values are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800, 345600, 604800, 1209600, and
 * 2419200 - any other value will be rounded to the nearest valid value.
 * @param data.refresh_sec { number } The amount of time in seconds before this Domain should be refreshed. Valid
 * values are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800, 345600, 604800, 1209600, and 2419200 - any other
 * value will be rounded to the nearest valid value.
 * @param data.soa_email { string <email> } Start of Authority email address. This is required for master Domains
 */
export const createDomain = (data: Partial<Linode.Domain>) =>
  Request<Domain>(
    setData(data),
    setURL(`${API_ROOT}/domains`),
    setMethod('POST'),
  );

/**
 * Update information about a Domain in Linode's DNS Manager.
 *
 * @param domainId { number } The ID of the Domain to access.
 * @param data { object }
 * @param data.domain { string } The domain this Domain represents.
 * @param data.type { string } If this Domain represents the authoritative source of information for the domain it
 * describes, or if it is a read-only copy of a master (also called a slave).
 * @param data.status { string } Used to control whether this Domain is currently being rendered.
 * @param data.description { string } A description for this Domain. This is for display purposes only.
 * @param data.ttl_sec { number } "Time to Live" - the amount of time in seconds that this Domain's records may be
 * cached by resolvers or other domain servers. Valid values are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800,
 * 345600, 604800, 1209600, and 2419200 - any other value will be rounded to the nearest valid value.
 * @param data.retry_sec { number } The interval, in seconds, at which a failed refresh should be retried. Valid values
 * are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800, 345600, 604800, 1209600, and 2419200 - any other value
 * will be rounded to the nearest valid value.
 * @param data.master_ips { number } The IP addresses representing the master DNS for this Domain.
 * @param data.axfr_ips { string[] } The list of IPs that may perform a zone transfer for this Domain. This is
 * potentially dangerous, and should be set to an empty list unless you intend to use it.
 * @param data.expire_sec { number } The amount of time in seconds that may pass before this Domain is no longer
 * authoritative. Valid values are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800, 345600, 604800, 1209600, and
 * 2419200 - any other value will be rounded to the nearest valid value.
 * @param data.refresh_sec { number } The amount of time in seconds before this Domain should be refreshed. Valid
 * values are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800, 345600, 604800, 1209600, and 2419200 - any other
 * value will be rounded to the nearest valid value.
 * @param data.soa_email { string <email> } Start of Authority email address. This is required for master Domains
 */
export const updateDomain = (domainId: number, data: Partial<Linode.Domain>
  ) => Request<Domain>(
    setURL(`${API_ROOT}/domains/${domainId}`),
    setMethod('PUT'),
    setData({ status: 'active', ...data }), // remove ability for user to change status
  );

/**
 * Deletes a Domain from Linode's DNS Manager. The Domain will be removed from Linode's nameservers shortly after this
 * operation completes. This also deletes all associated Domain Records.
 *
 * @param domainId { number } The ID of the Domain to delete
 */
export const deleteDomain = (domainID: number) =>
  Request<{}>(
    setURL(`${API_ROOT}/domains/${domainID}`),
    setMethod('DELETE'),
  );

/**
 * @param domainID The ID of the Domain to clone
 * @param cloneName { number } The name of the new domain
 */
export const cloneDomain = (domainID: number, cloneName: string) =>
  Request<Domain>(
    setData({ domain: cloneName }),
    setURL(`${API_ROOT}/domains/${domainID}/clone`),
    setMethod('POST'),
  );

/**
 * Imports a domain zone from a remote nameserver.
 *
 * @param domain { string } The domain to import.
 * @param remote_nameserver { string } The remote nameserver that allows zone transfers (AXFR).
 */
export const importZone = (domain?: string, remote_nameserver?: string) =>
  Request<Domain>(
    setData({ domain, remote_nameserver }, importZoneSchema),
    setURL(`${API_ROOT}/domains/import`),
    setMethod('POST'),
  );
