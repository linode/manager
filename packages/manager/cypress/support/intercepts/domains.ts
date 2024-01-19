/**
 * @file Cypress intercepts and mocks for Domain API requests.
 */

import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';

import type { Domain, DomainRecord, ZoneFile } from '@linode/api-v4';

/**
 * Intercepts POST request to create a Domain.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateDomain = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('domains'));
};

/**
 * Intercepts GET request to mock domain data.
 *
 * @param domains - an array of mock domain objects
 *
 * @returns Cypress chainable.
 */
export const mockGetDomains = (domains: Domain[]): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('domains*'), paginateResponse(domains));
};

/**
 * Intercepts POST request to create a Domain record.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateDomainRecord = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('domains/*/record*'));
};

/**
 * Intercepts GET request to get Domain records.
 *
 * @param records - an array of mock domain record objects
 *
 * @returns Cypress chainable.
 */
export const mockGetDomainRecords = (
  records: DomainRecord[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('domains/*/record*'),
    paginateResponse(records)
  );
};

/**
 * Intercepts POST request to import a Domain Zone.
 *
 * @param domain - a mock domain object
 *
 * @returns Cypress chainable.
 */
export const mockImportDomain = (domain: Domain): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('domains/import'), domain);
};

/**
 * Intercepts GET request to get a Domain detail.
 *
 * @param domainId - a mock domain ID
 * @param domain - a mock domain
 *
 * @returns Cypress chainable.
 */
export const mockGetDomain = (
  domainId: number,
  domain: Domain
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher(`domains/${domainId}`), domain);
};

/**
 * Intercepts GET request to get a Domain detail.
 *
 * @param domainId - a mock domain ID
 * @param zoneFile - a mock ZoneFile object
 *
 * @returns Cypress chainable.
 */
export const mockGetDomainZoneFile = (
  domainId: number,
  zoneFile: ZoneFile
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`domains/${domainId}/zone-file`),
    zoneFile
  );
};
