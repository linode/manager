/**
 * @file Cypress intercepts and mocks for Cloud Manager LKE operations.
 */

import type {
  KubernetesCluster,
  KubeNodePoolResponse,
  KubeConfigResponse,
  KubernetesVersion,
} from '@linode/api-v4/types';
import { kubernetesVersions } from 'support/constants/lke';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { makeResponse } from 'support/util/response';

/**
 * Intercepts GET request to retrieve Kubernetes versions and mocks response.
 *
 * @param versions - Optional array of strings containing mocked versions.
 *
 * @returns Cypress chainable.
 */
export const mockGetKubernetesVersions = (versions?: string[] | undefined) => {
  const versionObjects = (versions ? versions : kubernetesVersions).map(
    (kubernetesVersionString: string): KubernetesVersion => {
      return { id: kubernetesVersionString };
    }
  );

  return cy.intercept(
    'GET',
    apiMatcher('lke/versions*'),
    paginateResponse(versionObjects)
  );
};

/**
 * Intercepts GET request to retrieve LKE clusters and mocks response.
 *
 * @param clusters - LKE clusters with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetClusters = (
  clusters: KubernetesCluster[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher('lke/clusters*'),
    paginateResponse(clusters)
  );
};

/**
 * Intercepts GET request to retrieve an LKE cluster and mocks the response.
 *
 * @param cluster - LKE cluster with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetCluster = (
  cluster: KubernetesCluster
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`lke/clusters/${cluster.id}`),
    makeResponse(cluster)
  );
};

/**
 * Intercepts PUT request to update an LKE cluster and mocks response.
 *
 * @param clusterId - ID of cluster for which to intercept PUT request.
 * @param cluster - Updated Kubernetes cluster with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateCluster = (
  clusterId: number,
  cluster: KubernetesCluster
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`lke/clusters/${clusterId}`),
    makeResponse(cluster)
  );
};

/**
 * Intercepts GET request to retrieve an LKE cluster's node pools and mocks response.
 *
 * @param clusterId - ID of cluster for which to intercept GET request.
 * @param pools - Array of LKE node pools with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetClusterPools = (
  clusterId: number,
  pools: KubeNodePoolResponse[]
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`lke/clusters/${clusterId}/pools*`),
    paginateResponse(pools)
  );
};

/**
 * Intercepts GET request to retrieve an LKE cluster's kubeconfig and mocks response.
 *
 * @param clusterId - ID of cluster for which to mock response.
 * @param kubeconfig - Kubeconfig object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockGetKubeconfig = (
  clusterId: number,
  kubeconfig: KubeConfigResponse
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`lke/clusters/${clusterId}/kubeconfig`),
    makeResponse(kubeconfig)
  );
};

/**
 * Intercepts POST request to create an LKE cluster.
 *
 * @returns Cypress chainable.
 */
export const interceptCreateCluster = (): Cypress.Chainable<null> => {
  return cy.intercept('POST', apiMatcher('lke/clusters'));
};

/**
 * Intercepts POST request to create an LKE cluster and mocks the response.
 *
 * @param cluster - LKE cluster with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateCluster = (
  cluster: KubernetesCluster
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('lke/clusters'),
    makeResponse(cluster)
  );
};

/**
 * Intercepts DELETE request to delete an LKE cluster and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteCluster = (
  clusterId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`lke/clusters/${clusterId}`),
    makeResponse()
  );
};

/**
 * Intercepts DELETE request to reset Kubeconfig and mocks the response.
 *
 * @param clusterId - Numberic ID of LKE cluster for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockResetKubeconfig = (
  clusterId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`lke/clusters/${clusterId}/kubeconfig`),
    makeResponse({})
  );
};
