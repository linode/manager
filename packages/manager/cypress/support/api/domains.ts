import { getAll, deleteById, apiCheckErrors } from './common';
import { isTestLabel } from 'support/api/common';
import { randomDomainName } from 'support/util/random';

const oauthtoken = Cypress.env('MANAGER_OAUTH');
const relativeApiPath = 'domains';

export const getDomains = () => getAll(relativeApiPath);

export const deleteDomainById = (id) => deleteById(relativeApiPath, id);

/**
 * Deletes all domains which are prefixed with the test entity prefix.
 */
export const deleteAllTestDomains = () => {
  getDomains().then((resp) => {
    resp.body.data.forEach((domain) => {
      if (isTestLabel(domain.domain)) {
        deleteDomainById(domain.id);
      }
    });
  });
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
      bearer: oauthtoken,
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
