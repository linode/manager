import { takeLast } from 'ramda';

export const isValidDomainRecord = (
  hostname: string,
  records: Linode.DomainRecord[]
) => {
  return isUniqueHostname(hostname, records);
};

export const isValidSOAEmail = (email: string, hostname: string) => {
  // admin@example.com --> example.com
  const emailDomain = email.split('@')[1];
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
