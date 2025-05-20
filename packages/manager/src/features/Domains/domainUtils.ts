import { createDomainRecord } from '@linode/api-v4/lib/domains';

import type { DomainRecord, DomainType } from '@linode/api-v4/lib/domains';

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

export const generateDefaultDomainRecords = (
  domain: string,
  domainID: number,
  ipv4?: string,
  ipv6?: null | string
) => {
  /**
   * At this point, the IPv6 is including the prefix and we need to strip that
   *
   * BUT
   *
   * this logic only applies to Linodes' ipv6, not NodeBalancers. No stripping
   * needed for NodeBalancers.
   */
  const cleanedIPv6 =
    ipv6 && ipv6.includes('/') ? ipv6.substr(0, ipv6.indexOf('/')) : ipv6;

  const baseIPv4Requests = [
    createDomainRecord(domainID, {
      target: ipv4,
      type: 'A',
    }),
    createDomainRecord(domainID, {
      name: 'www',
      target: ipv4,
      type: 'A',
    }),
    createDomainRecord(domainID, {
      name: 'mail',
      target: ipv4,
      type: 'A',
    }),
  ];

  return Promise.all(
    /** ipv6 can be null so don't try to create domain records in that case */
    cleanedIPv6
      ? [
          ...baseIPv4Requests,
          createDomainRecord(domainID, {
            target: cleanedIPv6,
            type: 'AAAA',
          }),
          createDomainRecord(domainID, {
            name: 'www',
            target: cleanedIPv6,
            type: 'AAAA',
          }),
          createDomainRecord(domainID, {
            name: 'mail',
            target: cleanedIPv6,
            type: 'AAAA',
          }),
          createDomainRecord(domainID, {
            priority: 10,
            target: `mail.${domain}`,
            type: 'MX',
          }),
        ]
      : baseIPv4Requests
  );
};
