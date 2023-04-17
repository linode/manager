import { apiCheckErrors } from './common';
import { isTestLabel } from 'support/api/common';
import { randomDomainName } from 'support/util/random';
import { Domain, getDomains, deleteDomain } from '@linode/api-v4';
import { depaginate } from 'support/util/paginate';
import { oauthToken, pageSize } from 'support/constants/api';

/**
 * Deletes all domains which are prefixed with the test entity prefix.
 *
 * @returns Promise that resolves when domains have been deleted.
 */
export const deleteAllTestDomains = async (): Promise<void> => {
  const domains = await depaginate<Domain>((page: number) =>
    getDomains({ page_size: pageSize, page })
  );

  const deletionPromises = domains
    .filter((domain: Domain) => isTestLabel(domain.domain))
    .map((domain: Domain) => deleteDomain(domain.id));

  await Promise.all(deletionPromises);
};

const makeDomainCreateReq = (domain) => {
  const domainData = domain
    ? domain
    : {
        domain: randomDomainName(),
        type: 'master',
        soa_email: 'admin@example.com',
      };

  return cy.request({
    method: 'POST',
    url: Cypress.env('REACT_APP_API_ROOT') + '/domains',
    body: domainData,
    auth: {
      bearer: oauthToken,
    },
  });
};

/**
 * Use this method if you do not need to get the request detail
 * @param domain if undefined will use default
 * @returns domain object
 */
export const createDomain = (domain = undefined) => {
  return makeDomainCreateReq(domain).then((resp) => {
    apiCheckErrors(resp);
    console.log(`Created Domain ${resp.body.label} successfully`, resp);
    return resp.body;
  });
};
