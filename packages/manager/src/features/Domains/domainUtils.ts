import { DomainRecord, DomainType } from '@linode/api-v4/lib/domains';

export const isValidDomainRecord = (
  hostname: string,
  records: DomainRecord[]
) => {
  return isUniqueHostname(hostname, records);
};

/**
 * Validation
 *
 */

export const isUniqueHostname = (hostname: string, records: DomainRecord[]) => {
  return !records.some(
    (record) => record.type === 'CNAME' && record.name === hostname
  );
};

export const isValidCNAME = (cname: string, records: DomainRecord[]) => {
  return !records.some((thisRecord) => thisRecord.name === cname);
};

export const transferHelperText = `IP addresses that may perform a zone transfer for this Domain. This is
potentially dangerous, and should be left empty unless you intend to
use it.`;

export const getInitialIPs = (ipsFromProps?: string[]): string[] => {
  const ips = ipsFromProps ?? [''];
  return ips.length > 0 ? ips : [''];
};

export const isEditableNameServer = (nameServerId: number) => {
  const nameServerDummyId = -1;

  return nameServerDummyId !== nameServerId ? true : false;
};

/**
 * This is for Phase 1 of the conversion process, which
 * assumes the API is still returning either master or slave
 * for the Domain type. It can be adjusted to handle all
 * possible values once the API is confirmed to support them.
 */
export const getDomainDisplayType = (domainType: DomainType) =>
  domainType === 'master' ? 'primary' : 'secondary';
