import { DomainRecord } from 'linode-js-sdk/lib/domains';

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
    record => record.type === 'CNAME' && record.name === hostname
  );
};

export const isValidCNAME = (cname: string, records: DomainRecord[]) => {
  return !records.some(thisRecord => thisRecord.name === cname);
};
