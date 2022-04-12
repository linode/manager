/**
 * @file Cypress intercepts for Cloud Manager Object Storage operations.
 */

import { sequentialStub } from 'support/stubs/sequential-stub';
import { makePaginatedResponse } from 'support/util/response';
import { objectStorageBucketFactory } from 'src/factories/objectStorage';

/**
 * Intercepts GET requests to fetch buckets.
 *
 * Only returns data for the first request intercepted.
 *
 * @param data - Mock response data.
 */
export const interceptBuckets = (data: any): Cypress.Chainable<null> => {
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
    sequentialStub([makePaginatedResponse(data), makePaginatedResponse([])])
  );
};

/**
 * Intercepts POST request to create bucket.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 *
 * @returns Cypress chainable.
 */
export const interceptBucketCreate = (
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
 * Intercepts DELETE request to delete bucket.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 *
 * @returns Cypress chainable.
 */
export const interceptBucketDelete = (
  label: string,
  cluster: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    `*/object-storage/buckets/${cluster}/${label}`,
    {}
  );
};

/**
 * Intercepts GET request to fetch bucket objects.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param data - Mocked response data.
 *
 * @returns Cypress chainable.
 */
export const interceptBucketObjectList = (
  label: string,
  cluster: string,
  data: any
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    `*/object-storage/buckets/${cluster}/${label}/object-list?delimiter=%2F&prefix=`,
    makePaginatedResponse(data)
  );
};

/**
 * Intercepts POST request to upload bucket object.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 *
 * @returns Cypress chainable.
 */
export const interceptBucketObjectUpload = (
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
 * Intercepts S3 PUT request to upload bucket object.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 *
 * @returns Cypress chainable.
 */
export const interceptBucketObjectS3Upload = (
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
 * Intercepts POST request to delete bucket object.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 *
 * @returns Cypress chainable.
 */
export const interceptBucketObjectDelete = (
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
 * Intercepts S3 DELETE request to delete bucket object.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Object filename.
 * @param status - Response status.
 *
 * @returns Cypress chainable.
 */
export const interceptBucketObjectS3Delete = (
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
