/**
 * @file Cypress intercepts and mocks for Cloud Manager Object Storage operations.
 */

import { sequentialStub } from 'support/stubs/sequential-stub';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

import { objectStorageBucketFactory } from 'src/factories/objectStorage';

import type { ObjectStorageBucket, ObjectStorageKey } from '@linode/api-v4';
import { Cluster } from 'cluster';

/**
 * Intercepts GET requests to fetch buckets.
 *
 * @returns Cypress chainable.
 */
export const interceptGetBuckets = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('object-storage/buckets/*'));
};

/**
 * Intercepts GET requests to fetch buckets and mocks response.
 *
 * Only returns data for the first request intercepted.
 *
 * @param buckets - Object storage buckets with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetBuckets = (
  buckets: ObjectStorageBucket[]
): Cypress.Chainable<null> => {
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
    apiMatcher('object-storage/buckets/*'),
    sequentialStub([paginateResponse(buckets), paginateResponse([])])
  );
};

/**
 * Intercepts POST request to create bucket.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateBucket = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('object-storage/buckets'));
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
    apiMatcher('object-storage/buckets'),
    objectStorageBucketFactory.build({
      cluster,
      hostname: `${label}.${cluster}.linodeobjects.com`,
      label,
    })
  );
};

/**
 * Intercepts DELETE request to delete bucket.
 *
 * If a bucket label and cluster are provided, only requests to delete the
 * given bucket in the given cluster are intercepted.
 *
 * If only a cluster is provided, only requests to delete buckets in the
 * given cluster are intercepted.
 *
 * If no cluster or label are provided, all requests to delete buckets are
 * intercepted.
 *
 * @param label - Optional label for bucket deletion to intercept.
 * @param cluster - Optional cluster for bucket deletion to intercept.
 *
 * @returns Cypress chainable.
 */
export const interceptDeleteBucket = (
  label?: string,
  cluster?: string
): Cypress.Chainable<null> => {
  if (label && cluster) {
    return cy.intercept(
      'DELETE',
      apiMatcher(`object-storage/buckets/${cluster}/${label}`)
    );
  }
  if (cluster) {
    return cy.intercept(
      'DELETE',
      apiMatcher(`object-storage/buckets/${cluster}/*`)
    );
  }
  return cy.intercept('DELETE', apiMatcher('object-storage/buckets/*'));
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
    apiMatcher(`object-storage/buckets/${cluster}/${label}`),
    {
      body: {},
      statusCode,
    }
  );
};

/**
 * Intercepts GET request to fetch bucket objects and mocks response.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param data - Mocked response data.
 * @param statusCode - Mocked response status code.
 *
 * @returns Cypress chainable.
 */
export const mockGetBucketObjects = (
  label: string,
  cluster: string,
  data: any,
  statusCode: number = 200
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(
      `object-storage/buckets/${cluster}/${label}/object-list?delimiter=%2F&prefix=`
    ),
    {
      body: {
        data,
        is_truncated: false,
        next_marker: null,
      },
      statusCode,
    }
  );
};

/**
 * Intercepts POST request to upload bucket object and mocks response.
 *
 * By default, an HTTP 200 response which contains the S3 URL for the object
 * is mocked.
 *
 * @param label - Object storage bucket label.
 * @param cluster - Object storage bucket cluster.
 * @param filename - Mocked response object filename.
 * @param data - Optional mocked response data.
 * @param statusCode - Opiontal mocked response status code.
 *
 * @returns Cypress chainable.
 */
export const mockUploadBucketObject = (
  label: string,
  cluster: string,
  filename: string,
  data?: any,
  statusCode: number = 200
): Cypress.Chainable<null> => {
  const mockResponse = {
    body: data || {
      exists: false,
      url: `https://${cluster}.linodeobjects.com:443/${label}/${filename}`,
    },
    statusCode,
  };

  return cy.intercept(
    'POST',
    apiMatcher(`object-storage/buckets/${cluster}/${label}/object-url`),
    mockResponse
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
export const interceptUploadBucketObjectS3 = (
  label: string,
  cluster: string,
  filename: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    `https://${cluster}.linodeobjects.com/${label}/${filename}*`
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
    apiMatcher(`object-storage/buckets/${cluster}/${label}/object-url`),
    {
      exists: true,
      url: `https://${cluster}.linodeobjects.com:443/${label}/${filename}`,
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
 * Intercepts GET request to fetch object storage access keys.
 *
 * @returns Cypress chainable.
 */
export const interceptGetAccessKeys = (): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('object-storage/keys*'));
};

/**
 * Intercepts GET request to fetch object storage access keys, and mocks response.
 *
 * @param response - Mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockGetAccessKeys = (
  accessKeys: ObjectStorageKey[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('object-storage/keys*'),
    paginateResponse(accessKeys)
  );
};

/**
 * Intercepts object storage access key POST request.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateAccessKey = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('object-storage/keys'));
};

/**
 * Intercepts object storage access key POST request and mocks response.
 *
 * @param accessKey - Access key with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateAccessKey = (
  accessKey: ObjectStorageKey
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('object-storage/keys'),
    makeResponse(accessKey)
  );
};

/**
 * Intercepts object storage access key DELETE request and mocks success response.
 *
 * @param keyId - ID of access key for which to intercept DELETE request.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteAccessKey = (keyId: number): Cypress.Chainable<null> => {
  return cy.intercept('DELETE', apiMatcher(`object-storage/keys/${keyId}`), {
    body: {},
    statusCode: 200,
  });
};

/**
 * Intercepts POST request to cancel Object Storage and mocks response.
 *
 * @returns Cypress chainable.
 */
export const mockCancelObjectStorage = (): Cypress.Chainable => {
  return cy.intercept('POST', apiMatcher('object-storage/cancel'), {});
};

/**
 * Intercepts GET request to fetch Object Storage clusters and mocks response.
 *
 * @param clusters - Clusters with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetClusters = (clusters: Cluster[]): Cypress.Chainable => {
  return cy.intercept(
    'GET',
    apiMatcher('object-storage/clusters*'),
    paginateResponse(clusters)
  );
};
