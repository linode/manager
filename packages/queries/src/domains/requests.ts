import { getDomainRecords, getDomains } from '@linode/api-v4';
import { getAll } from '@linode/utilities';

import type { Domain, DomainRecord } from '@linode/api-v4';

export const getAllDomains = () =>
  getAll<Domain>((params) => getDomains(params))().then((data) => data.data);

export const getAllDomainRecords = (domainId: number) =>
  getAll<DomainRecord>((params) => getDomainRecords(domainId, params))().then(
    ({ data }) => data,
  );
