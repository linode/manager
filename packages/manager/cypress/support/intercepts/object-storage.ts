/**
 * @file Cypress intercepts for Cloud Manager Object Storage operations.
 */
import { Response } from 'support/util/response';
import { sequentialStub } from 'support/stubs/sequential-stub';
import { paginateResponse } from 'support/util/paginate';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';

/**
 * Intercepts GET requests to fetch buckets and mocks response.
 *
 * Only returns data for the first request intercepted.
 *
 * @param data - Mock response data.
 */
export const mockGetBuckets = (data: any): Cypress.Chainable<null> => {
  /*
   * Only the first mocked response will contain data. Subsequent responses
   * will contain an empty array.
   *
   * This is necessary because the Object Storage Buckets landing page makes
   * an indeterminate number of requests to `/object-storage/buckets/<region>`,
   * where `<region>` may be any region where Object Storage is supported.
   */
  return cy.intercept(
    'GET',
    '*/object-storage/buckets/*',
    sequentialStub([paginateResponse(data), paginateResponse([])])
  );
};

/**
 * Intercepts POST request to create bucket and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 *
 * @returns Cypress chainable.
 */
export const mockCreateBucket = (
  label: string,
  cluster: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    '*/object-storage/buckets',
    objectStorageBucketFactory.build({
      label,
      cluster,
      hostname: `${label}.${cluster}.linodeobjects.com`,
    })
  );
};

/**
 * Intercepts DELETE request to delete bucket and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteBucket = (
  label: string,
  cluster: string,
  statusCode: number = 200
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    `*/object-storage/buckets/${cluster}/${label}`,
    {
      statusCode,
      body: {},
    }
  );
};

/**
 * Intercepts GET request to fetch bucket objects and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param data - Mocked response data.
 *
 * @returns Cypress chainable.
 */
export const mockGetBucketObjects = (
  label: string,
  cluster: string,
  data: any
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    `*/object-storage/buckets/${cluster}/${label}/object-list?delimiter=%2F&prefix=`,
    paginateResponse(data)
  );
};

/**
 * Intercepts POST request to upload bucket object and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Mocked response object filename.
 *
 * @returns Cypress chainable.
 */
export const mockUploadBucketObject = (
  label: string,
  cluster: string,
  filename: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    `*/object-storage/buckets/${cluster}/${label}/object-url`,
    {
      url: `https://${cluster}.linodeobjects.com:443/${label}/${filename}`,
      exists: false,
    }
  );
};

/**
 * Intercepts S3 PUT request to upload bucket object and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 *
 * @returns Cypress chainable.
 */
export const mockUploadBucketObjectS3 = (
  label: string,
  cluster: string,
  filename: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    `https://${cluster}.linodeobjects.com/${label}/${filename}*`,
    {}
  );
};

/**
 * Intercepts POST request to delete bucket object and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteBucketObject = (
  label: string,
  cluster: string,
  filename: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    `*/object-storage/buckets/${cluster}/${label}/object-url`,
    {
      url: `https://${cluster}.linodeobjects.com:443/${label}/${filename}`,
      exists: true,
    }
  );
};

/**
 * Intercepts S3 DELETE request to delete bucket object and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 * @param status - Response status.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteBucketObjectS3 = (
  label: string,
  cluster: string,
  filename: string,
  status: number = 204
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    `https://${cluster}.linodeobjects.com/${label}/${filename}*`,
    {
      statusCode: status,
    }
  );
};

/**
 * Intercepts GET request to fetch object storage access keys, and mocks response.
 *
 * @param response - Mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockGetAccessKeys = (
  response: Partial<Response>
): Cypress.Chainable<null> => {
  return cy.intercept('GET', '*/object-storage/keys*', {
    statusCode: 200,
    body: {},
    ...response,
  });
};

/**
 * Intercepts object storage access key POST request and mocks response.
 *
 * @param response - Mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateAccessKey = (
  response: Partial<Response>
): Cypress.Chainable<null> => {
  return cy.intercept('POST', '*/object-storage/keys', {
    statusCode: 200,
    body: {},
    ...response,
  });
};

/**
 * Intercepts object storage access key DELETE request and mocks success response.
 *
 * @param keyId - ID of access key for which to intercept DELETE request.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteAccessKey = (keyId: number): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', `*/object-storage/keys/${keyId}`, {
    statusCode: 200,
    body: {},
  });
};

/**
 * Intercepts object storage access key POST request.
 *
 * @returns Cypress chainable.
 */
export const interceptAccessKeyCreate = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', '*/object-storage/keys');
};
