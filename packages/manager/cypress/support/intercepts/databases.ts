/**
 * @file Cypress intercepts and mocks for Cloud Manager DBaaS operations.
 */

import {
  Database,
  DatabaseCredentials,
} from '@linode/api-v4/lib/databases/types';
import { makeErrorResponse } from 'support/util/errors';
import { randomString } from 'support/util/random';

/**
 * Default message to use when performing operations on provisioning DBs.
 */
const defaultErrorMessageProvisioning =
  'Your database is provisioning; please wait until provisioning is complete to perform this operation.';

/**
 * Intercepts GET request to fetch database instance and mocks response.
 *
 * @param database - Response database.
 *
 * @returns Cypress chainable.
 */
export const mockGetDatabase = (
  database: Database
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    `*/databases/${database.engine}/instances/${database.id}`,
    database
  );
};

/**
 * Intercepts GET request to retrieve database credentials and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine.
 * @param password - Optional response password. If not specified, a random string is returned.
 *
 * @returns Cypress chainable.
 */
export const mockGetDatabaseCredentials = (
  id: number,
  engine: string,
  password?: string | undefined
): Cypress.Chainable<null> => {
  const username = engine === 'postgresql' ? 'linpostgres' : 'linroot';
  const responsePassword =
    password ||
    randomString(16, {
      spaces: false,
      uppercase: true,
      lowercase: true,
      symbols: true,
      numbers: true,
    });

  const credentials: DatabaseCredentials = {
    username,
    password: responsePassword,
  };

  return cy.intercept(
    'GET',
    `*/databases/${engine}/instances/${id}/credentials`,
    credentials
  );
};

/**
 * Intercepts PUT request to update an active database and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateDatabase = (
  id: number,
  engine: string,
  responseData: any = {}
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    `*/databases/${engine}/instances/${id}`,
    responseData
  );
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
 * Intercepts POST request to reset an active database's password and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 *
 * @returns Cypress chainable.
 */
export const mockResetPassword = (
  id: number,
  engine: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    `*/databases/${engine}/instances/${id}/credentials/reset`,
    {}
  );
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
