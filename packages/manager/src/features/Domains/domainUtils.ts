import { takeLast } from 'ramda';

export const isValidDomainRecord = (
  hostname: string,
  records: Linode.DomainRecord[]
) => {
  return isUniqueHostname(hostname, records);
};

/**
 * Validation
 *
 * Currently, the API does not check that the soaEmail
 * is not associated with the target hostname. If you're creating
 * example.com, using `marty@example.com` as your soaEmail is unwise
 * (though technically won't break anything).
 */
export const isValidSOAEmail = (email: string, hostname: string) => {
  // admin@example.com --> example.com
  const emailDomain = email.substr(email.indexOf('@') + 1);
  // mail.example.com --> example.com
  const strippedHostname = takeLast(2, hostname.split('.')).join('.');
  return strippedHostname !== emailDomain;
};

export const isUniqueHostname = (
  hostname: string,
  records: Linode.DomainRecord[]
) => {
  return !records.some(
    record => record.type === 'CNAME' && record.name === hostname
  );
};

export const isValidCNAME = (cname: string, records: Linode.DomainRecord[]) => {
  return !records.some(thisRecord => thisRecord.name === cname);
};
