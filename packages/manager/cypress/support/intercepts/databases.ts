/**
 * @file Cypress intercepts and mocks for Cloud Manager DBaaS operations.
 */

import { Database } from '@linode/api-v4';
import { makeErrorResponse } from 'support/util/errors';

/**
 * Default message to use when performing operations on provisioning DBs.
 */
const defaultErrorMessageProvisioning =
  'Your database is provisioning; please wait until provisioning is complete to perform this operation.';

/**
 * Intercepts GET request to fetch database instance and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 * @param database - Response database.
 *
 * @returns Cypress chainable.
 */
export const mockGetDatabase = (
  id: number,
  engine: string,
  database: Database
): Cypress.Chainable<null> => {
  return cy.intercept('GET', `*/databases/${engine}/instances/${id}`, database);
};

/**
 * Intercepts PUT request to update a provisioning database and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 * @param responseErrorMessage - Optional error message for mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateProvisioningDatabase = (
  id: number,
  engine: string,
  responseErrorMessage?: string | undefined
): Cypress.Chainable<null> => {
  const error = makeErrorResponse(
    responseErrorMessage || defaultErrorMessageProvisioning
  );
  return cy.intercept('PUT', `*/databases/${engine}/instances/${id}`, error);
};

/**
 * Intercepts POST request to reset a provisioning database's password and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 * @param responseErrorMessage - Optional error message for mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockResetPasswordProvisioningDatabase = (
  id: number,
  engine: string,
  responseErrorMessage?: string | undefined
): Cypress.Chainable<null> => {
  const error = makeErrorResponse(
    responseErrorMessage || defaultErrorMessageProvisioning
  );
  return cy.intercept(
    'POST',
    `*/databases/${engine}/instances/${id}/credentials/reset`,
    error
  );
};

/**
 * Intercepts DELETE request to delete a database and mocks 200 response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteDatabase = (
  id: number,
  engine: string
): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', `*/databases/${engine}/instances/${id}`, {});
};

/**
 * Intercepts DELETE request to delete a provisioning database and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 * @param responseErrorMessage - Optional error message for mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteProvisioningDatabase = (
  id: number,
  engine: string,
  responseErrorMessage?: string | undefined
): Cypress.Chainable<null> => {
  const error = makeErrorResponse(
    responseErrorMessage || defaultErrorMessageProvisioning
  );
  return cy.intercept('DELETE', `*/databases/${engine}/instances/${id}`, error);
};
