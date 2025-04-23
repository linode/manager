import { deleteDomain, getDomains } from '@linode/api-v4';
import { isTestLabel } from 'support/api/common';
import { oauthToken, pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';
import { randomDomainName } from 'support/util/random';

import { createDomainPayloadFactory } from 'src/factories';

import { apiCheckErrors } from './common';

import type { CreateDomainPayload, Domain } from '@linode/api-v4';

/**
 * Deletes all domains which are prefixed with the test entity prefix.
 *
 * @returns Promise that resolves when domains have been deleted.
 */
export const deleteAllTestDomains = async (): Promise<void> => {
  const domains = await depaginate<Domain>((page: number) =>
    getDomains({ page, page_size: pageSize })
  );

  const deletionPromises = domains
    .filter((domain: Domain) => isTestLabel(domain.domain))
    .map((domain: Domain) => deleteDomain(domain.id));

  await Promise.all(deletionPromises);
};

const makeDomainCreateReq = (domainPayload?: CreateDomainPayload) => {
  const domainData: CreateDomainPayload = domainPayload
    ? domainPayload
    : createDomainPayloadFactory.build({
        domain: randomDomainName(),
        soa_email: 'admin@example.com',
        type: 'master',
      });

  return cy.request({
    auth: {
      bearer: oauthToken,
    },
    body: domainData,
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/domains',
  });
};

/**
 * Use this method if you do not need to get the request detail
 * @param domain if undefined will use default
 * @returns domain object
 */
export const createDomain = (domain?: Domain) => {
  return makeDomainCreateReq(domain).then((resp) => {
    apiCheckErrors(resp);
    console.log(`Created Domain ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};
