import { entityPrefix } from '../constants/cypress';

const apiroot = Cypress.env('REACT_APP_API_ROOT') + '/';
const apirootBeta = Cypress.env('REACT_APP_API_ROOT') + 'beta/';
const oauthtoken = Cypress.env('MANAGER_OAUTH');

export const apiCheckErrors = (resp, failOnError = true) => {
  let errs = undefined;
  if (resp.body && resp.body.ERRORARRAY && resp.body.ERRORARRAY.length > 0) {
    errs = resp.body.ERRORARRAY;
  }
  if (failOnError) {
    if (errs) {
      expect(errs[0].ERRORMESSAGE).not.to.be.exist;
    } else {
      expect(!!errs).to.be.false;
    }
  }
  return errs;
};

export const getAll = (path: string, headers = {}) => {
  return cy.request({
    method: 'GET',
    url: `${apiroot}${path}`,
    headers,
    auth: {
      bearer: oauthtoken,
    },
  });
};

export const getAllBeta = (path: string) => {
  return cy.request({
    method: 'GET',
    url: `${apirootBeta}${path}`,
    auth: {
      bearer: oauthtoken,
    },
  });
};

/**
 * Deletes an entity with the given ID.
 *
 * @param path API path for the type of entity to delete.
 * @param id ID of entity to delete.
 *
 * @example
 * // Delete a volume whose ID is `123`.
 * deleteById('volumes', 123);
 */
export const deleteById = (path: string, id: number) => {
  return cy.request({
    method: 'DELETE',
    url: `${apiroot}${path}/${id}`,
    auth: {
      bearer: oauthtoken,
    },
    // Sometimes a entity may fail to delete. This should not fail a test.
    // Ex. A Linode created by Cypress may be cloning due to another E2E test
    //     running and the API will return 400. We don't want to fail due
    //     to another e2e in progress.
    failOnStatusCode: false,
  });
};

export const deleteByIdBeta = (path: string, id: number) => {
  return cy.request({
    method: 'DELETE',
    url: `${apirootBeta}${path}/${id}`,
    auth: {
      bearer: oauthtoken,
    },
  });
};

/**
 * Deletes an entity with the given label.
 *
 * @param path API path for the type of entity to delete.
 * @param label Label of entity to delete.
 *
 * @example
 * // Delete a tag named "cy-test-my-label".
 * deleteByLabel('tags', 'cy-test-my-label');
 */
export const deleteByLabel = (path: string, label: string) => {
  return cy.request({
    method: 'DELETE',
    url: `${apiroot}${path}/${label}`,
    auth: {
      bearer: oauthtoken,
    },
    failOnStatusCode: false,
  });
};

// @TODO Remove this in favor of constants defined in `../constants/cypress.ts`.
export const testTag = 'cy-test';

// Images do not have tags
export const isTestEntity = (entity) =>
  entity.tags?.includes(testTag) ||
  entity.label?.startsWith(entityPrefix) ||
  entity.summary?.includes(testTag);

/**
 * Determines whether or not a label is a test label.
 *
 * @param label Label to check.
 *
 * @example
 * isTestLabel('my-label'); // `false`.
 * isTestLabel('cy-test-my-label'); // `true`.
 *
 * @returns True if label is a test label, false otherwise.
 */
export const isTestLabel = (label: string) => {
  return label.startsWith(entityPrefix);
};
