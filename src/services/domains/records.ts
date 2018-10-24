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
  );

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
  );

/**
 * Adds a new Domain Record to the zonefile this Domain represents.
 *
 * @param domainId { number } The ID of the Domain we are accessing Records for.
 * @param data { object }
 * @param data.type { string } The type of Record this is in the DNS system. For example, A records associate a
 * domain name with an IPv4 address, and AAAA records associate a domain name with an IPv6 address.
 * @param data.weight { number } The relative weight of this Record. Higher values are preferred.
 * @param data.name { string } The name of this Record. This field's actual usage depends on the type of record this
 * represents. For A and AAAA records, this is the subdomain being associated with an IP address.
 * @param data.target { string } The target for this Record. This field's actual usage depends on the type of record
 * this represents. For A and AAAA records, this is the address the named Domain should resolve to.
 * @param data.priority { number } The priority of the target host. Lower values are preferred.
 * @param data.port { number } The port this Record points to.
 * @param data.service { string } The service this Record identified. Only valid for SRV records.
 * @param data.protocol { string } The protocol this Record's service communicates with. Only valid for SRV records.
 * @param data.ttl_sec { number } TTime to Live" - the amount of time in seconds that this Domain's records may be
 * cached by resolvers or other domain servers. Valid values are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800,
 * 345600, 604800, 1209600, and 2419200 - any other value will be rounded to the nearest valid value.
 * @param data.tag { string } The tag portion of a CAA record. It is invalid to set this on other record types.
 */
export const createDomainRecord = (domainId: number, data: Partial<Record>) =>
  Request<Record>(
    setURL(`${API_ROOT}/domains/${domainId}/records`),
    setMethod('POST'),
    setData(data),
  );

/**
 * Updates a single Record on this Domain.
 *
 * @param domainId { number } The ID of the Domain we are accessing Records for.
 * @param recordId { number } The ID of the Record you are accessing.
 * @param data { object }
 * @param data.type { string } The type of Record this is in the DNS system. For example, A records associate a
 * domain name with an IPv4 address, and AAAA records associate a domain name with an IPv6 address.
 * @param data.weight { number } The relative weight of this Record. Higher values are preferred.
 * @param data.name { string } The name of this Record. This field's actual usage depends on the type of record this
 * represents. For A and AAAA records, this is the subdomain being associated with an IP address.
 * @param data.target { string } The target for this Record. This field's actual usage depends on the type of record
 * this represents. For A and AAAA records, this is the address the named Domain should resolve to.
 * @param data.priority { number } The priority of the target host. Lower values are preferred.
 * @param data.port { number } The port this Record points to.
 * @param data.service { string } The service this Record identified. Only valid for SRV records.
 * @param data.protocol { string } The protocol this Record's service communicates with. Only valid for SRV records.
 * @param data.ttl_sec { number } TTime to Live" - the amount of time in seconds that this Domain's records may be
 * cached by resolvers or other domain servers. Valid values are 300, 3600, 7200, 14400, 28800, 57600, 86400, 172800,
 * 345600, 604800, 1209600, and 2419200 - any other value will be rounded to the nearest valid value.
 * @param data.tag { string } The tag portion of a CAA record. It is invalid to set this on other record types.
 */
export const updateDomainRecord = (
  domainId: number,
  recordId: number,
  data: Partial<Record>,
  ) => Request<Record>(
    setURL(`${API_ROOT}/domains/${domainId}/records/${recordId}`),
    setMethod('PUT'),
    setData(data),
  );

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
  );
