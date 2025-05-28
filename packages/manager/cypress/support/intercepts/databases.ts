/**
 * @file Cypress intercepts and mocks for Cloud Manager DBaaS operations.
 */

import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { randomString } from 'support/util/random';
import { makeResponse } from 'support/util/response';

import type {
  Database,
  DatabaseCredentials,
  DatabaseEngine,
  DatabaseEngineConfig,
  DatabaseType,
  Engine,
} from '@linode/api-v4';

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
    apiMatcher(`databases/${database.engine}/instances/${database.id}`),
    makeResponse(database)
  );
};

/**
 * Intercepts GET request to fetch database instances and mocks response.
 *
 * @param databases - Databases with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetDatabases = (
  databases: Database[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`databases/instances*`),
    paginateResponse(databases)
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
      lowercase: true,
      numbers: true,
      spaces: false,
      symbols: true,
      uppercase: true,
    });

  const credentials: DatabaseCredentials = {
    password: responsePassword,
    username,
  };

  return cy.intercept(
    'GET',
    apiMatcher(`databases/${engine}/instances/${id}/credentials`),
    credentials
  );
};

/**
 * Intercepts POST request to create a database and mocks response.
 *
 * @param database - Database with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateDatabase = (database: Database): Cypress.Chainable => {
  return cy.intercept(
    'POST',
    apiMatcher(`databases/${database.engine}/instances`),
    makeResponse(database)
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
    apiMatcher(`databases/${engine}/instances/${id}`),
    responseData
  );
};

/**
 * Intercepts POST request to reset an active database's password and mocks response.
 *
 * @param id - Database ID.
 * @param engine - Database engine type.
 *
 * @returns Cypress chainable.
 */

export const mockResize = (
  id: number,
  engine: string,
  responseData: any = {}
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`databases/${engine}/instances/${id}`),
    responseData
  );
};

export const mockResizeProvisioningDatabase = (
  id: number,
  engine: string,
  responseErrorMessage?: string | undefined
): Cypress.Chainable<null> => {
  const error = makeErrorResponse(
    responseErrorMessage || defaultErrorMessageProvisioning
  );
  return cy.intercept(
    'PUT',
    apiMatcher(`databases/${engine}/instances/${id}`),
    error
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
  return cy.intercept(
    'PUT',
    apiMatcher(`databases/${engine}/instances/${id}`),
    error
  );
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
    apiMatcher(`databases/${engine}/instances/${id}/credentials/reset`),
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
    apiMatcher(`databases/${engine}/instances/${id}/credentials/reset`),
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
  return cy.intercept(
    'DELETE',
    apiMatcher(`databases/${engine}/instances/${id}`),
    {}
  );
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
  return cy.intercept(
    'DELETE',
    apiMatcher(`databases/${engine}/instances/${id}`),
    error
  );
};

/**
 * Intercepts GET request to fetch DBaaS node types and mocks response.
 *
 * @param databaseTypes - Database node types.
 *
 * @returns Cypress chainable.
 */
export const mockGetDatabaseTypes = (
  databaseTypes: DatabaseType[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('databases/types*'),
    paginateResponse(databaseTypes)
  );
};

/**
 * Intercepts GET request to fetch available DBaaS engines and mocks response.
 *
 * @param engines - Database engine types.
 *
 * @returns Cypress chainable.
 */
export const mockGetDatabaseEngines = (
  engines: DatabaseEngine[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('databases/engines*'),
    paginateResponse(engines)
  );
};

/**
 * Mocks an error response for the GET request to retrieve database instances in CloudPulse.
 *
 * This function intercepts the 'GET' request made to the CloudPulse API endpoint for retrieving database instances
 * and simulates an error response with a customizable error message and HTTP status code.
 *
 * @param {string} errorMessage - The error message to include in the mock response body.
 * @param {number} [status=500] - The HTTP status code for the mock response (defaults to 500 if not provided).
 *
 * @returns {Cypress.Chainable<null>} - A Cypress chainable object, indicating that the interception is part of a Cypress test chain.
 */
export const mockGetDatabasesError = (
  errorMessage: string,
  status: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('databases/instances*'),
    makeErrorResponse(errorMessage, status)
  );
};

export const mockGetDatabaseEngineConfigs = (
  engine: Engine,
  engineConfigs: DatabaseEngineConfig
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`databases/${engine}/config`),
    makeResponse(engineConfigs)
  );
};
