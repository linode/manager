/**
 * @file Cypress intercepts and mocks for Cloud Manager LKE operations.
 */

import {
  kubeEndpointFactory,
  kubernetesDashboardUrlFactory,
} from '@src/factories';
import {
  kubernetesVersions,
  latestEnterpriseTierKubernetesVersion,
  latestStandardTierKubernetesVersion,
} from 'support/constants/lke';
import { makeErrorResponse } from 'support/util/errors';
import { apiMatcher } from 'support/util/intercepts';
import { paginateResponse } from 'support/util/paginate';
import { randomDomainName } from 'support/util/random';
import { makeResponse } from 'support/util/response';

import type {
  KubeConfigResponse,
  KubeNodePoolResponse,
  KubernetesCluster,
  KubernetesControlPlaneACLPayload,
  KubernetesTier,
  KubernetesTieredVersion,
  KubernetesVersion,
  PriceType,
} from '@linode/api-v4';

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
 * Intercepts GET request to retrieve tiered Kubernetes versions and mocks response.
 *
 * @param tier - Standard or enterprise Kubernetes tier.
 * @param versions - Optional array of strings containing mocked tiered versions.
 *
 * @returns Cypress chainable.
 */
export const mockGetTieredKubernetesVersions = (
  tier: KubernetesTier,
  versions?: KubernetesTieredVersion[]
) => {
  const defaultTieredVersions =
    tier === 'enterprise'
      ? [latestEnterpriseTierKubernetesVersion]
      : [latestStandardTierKubernetesVersion];

  const versionObjects = (versions ? versions : defaultTieredVersions).map(
    (kubernetesTieredVersion): KubernetesTieredVersion => {
      return {
        id: kubernetesTieredVersion.id,
        tier: kubernetesTieredVersion.tier,
      };
    }
  );

  return cy.intercept(
    'GET',
    apiMatcher(`lke/tiers/${tier}/versions*`),
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
 * Intercepts POST request to create an LKE cluster and mocks an error response.
 *
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockCreateClusterError = (
  errorMessage: string = 'An unknown error occurred.',
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher('lke/clusters'),
    makeErrorResponse(errorMessage, statusCode)
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
 * Intercepts POST request to add a node pool and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodePool - Node pool response object with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockAddNodePool = (
  clusterId: number,
  nodePool: KubeNodePoolResponse
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`lke/clusters/${clusterId}/pools`),
    makeResponse(nodePool)
  );
};

/**
 * Intercepts PUT request to update a node pool and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodePoolId - Numeric ID of node pool for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateNodePool = (
  clusterId: number,
  nodePool: KubeNodePoolResponse
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`lke/clusters/${clusterId}/pools/${nodePool.id}`),
    makeResponse(nodePool)
  );
};

/**
 * Intercepts DELETE request to delete a node pool and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodePoolId - Numeric ID of node pool for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockDeleteNodePool = (
  clusterId: number,
  nodePoolId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'DELETE',
    apiMatcher(`lke/clusters/${clusterId}/pools/${nodePoolId}`),
    makeResponse({})
  );
};

/**
 * Intercepts POST request to recycle a node and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodeId - ID of node for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockRecycleNode = (
  clusterId: number,
  nodeId: string
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`lke/clusters/${clusterId}/nodes/${nodeId}/recycle`),
    makeResponse({})
  );
};

/**
 * Intercepts POST request to recycle a node pool and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param nodePoolId - Numeric ID of node pool for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockRecycleNodePool = (
  clusterId: number,
  poolId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`lke/clusters/${clusterId}/pools/${poolId}/recycle`),
    makeResponse({})
  );
};

/**
 * Intercepts POST request to recycle all of a cluster's nodes and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockRecycleAllNodes = (
  clusterId: number
): Cypress.Chainable<null> => {
  return cy.intercept(
    'POST',
    apiMatcher(`lke/clusters/${clusterId}/recycle`),
    makeResponse({})
  );
};

/**
 * Intercepts GET request to retrieve Kubernetes cluster dashboard URL and mocks response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param url - Optional URL to include in mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockGetDashboardUrl = (clusterId: number, url?: string) => {
  const dashboardUrl = url ?? `https://${randomDomainName()}`;
  const dashboardResponse = kubernetesDashboardUrlFactory.build({
    url: dashboardUrl,
  });

  return cy.intercept(
    'GET',
    apiMatcher(`lke/clusters/${clusterId}/dashboard`),
    makeResponse(dashboardResponse)
  );
};

/**
 * Intercepts GET request to retrieve cluster API endpoints and mocks response.
 *
 * By default, a single endpoint 'https://cy-test.linodelke.net:443' is returned.
 * Cloud Manager will only display endpoints that end with 'linodelke.net:443'.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param endpoints - Optional array of API endpoints to include in mocked response.
 *
 * @returns Cypress chainable.
 */
export const mockGetApiEndpoints = (
  clusterId: number,
  endpoints?: string[]
): Cypress.Chainable => {
  // Endpoint has to end with 'linodelke.net:443' to be displayed in Cloud.
  const kubeEndpoints = endpoints
    ? endpoints.map((endpoint: string) =>
        kubeEndpointFactory.build({ endpoint })
      )
    : kubeEndpointFactory.build({
        endpoint: `https://cy-test.linodelke.net:443`,
      });

  return cy.intercept(
    'GET',
    apiMatcher(`lke/clusters/${clusterId}/api-endpoints*`),
    paginateResponse(kubeEndpoints)
  );
};

/**
 * Intercepts DELETE request to reset Kubeconfig and mocks the response.
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
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

/**
 * Intercepts GET request for a cluster's Control Plane ACL and mocks the response
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param controlPlaneACL - control plane ACL data for which to mock response
 *
 * @returns Cypress chainable
 */
export const mockGetControlPlaneACL = (
  clusterId: number,
  controlPlaneACL: KubernetesControlPlaneACLPayload
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/lke/clusters/${clusterId}/control_plane_acl`),
    makeResponse(controlPlaneACL)
  );
};

/**
 * Intercepts GET request for a cluster's Control Plane ACL and mocks an error response
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable
 */
export const mockGetControlPlaneACLError = (
  clusterId: number,
  errorMessage: string = 'An unknown error occurred.',
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'GET',
    apiMatcher(`/lke/clusters/${clusterId}/control_plane_acl`),
    makeErrorResponse(errorMessage, statusCode)
  );
};

/**
 * Intercepts PUT request for a cluster's Control Plane ACL and mocks the response
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param controlPlaneACL - control plane ACL data for which to mock response
 *
 * @returns Cypress chainable
 */
export const mockUpdateControlPlaneACL = (
  clusterId: number,
  controlPlaneACL: KubernetesControlPlaneACLPayload
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`/lke/clusters/${clusterId}/control_plane_acl`),
    makeResponse(controlPlaneACL)
  );
};

/**
 * Intercepts PUT request for a cluster's Control Plane ACL and mocks the response
 *
 * @param clusterId - Numeric ID of LKE cluster for which to mock response.
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateControlPlaneACLError = (
  clusterId: number,
  errorMessage: string = 'An unknown error occurred.',
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`/lke/clusters/${clusterId}/control_plane_acl`),
    makeErrorResponse(errorMessage, statusCode)
  );
};

/**
 * Intercepts GET request for LKE cluster types and mocks the response
 *
 * @param types - LKE cluster types with which to mock response
 *
 * @returns Cypress chainable
 */
export const mockGetLKEClusterTypes = (
  types: PriceType[]
): Cypress.Chainable<null> => {
  return cy.intercept('GET', apiMatcher('lke/types*'), paginateResponse(types));
};

/**
 * Intercepts PUT request to update an LKE cluster and mocks an error response.
 *
 * @param clusterId - ID of cluster for which to intercept PUT request.
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateClusterError = (
  clusterId: number,
  errorMessage: string = 'An unknown error occurred.',
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`lke/clusters/${clusterId}`),
    makeErrorResponse(errorMessage, statusCode)
  );
};

/**
 * Intercepts PUT request to update an LKE cluster node pool and mocks an error response.
 *
 * @param clusterId - ID of cluster for which to intercept PUT request.
 * @param nodePoolId - Numeric ID of node pool for which to mock response.
 * @param errorMessage - Optional error message with which to mock response.
 * @param statusCode - HTTP status code with which to mock response.
 *
 * @returns Cypress chainable.
 */
export const mockUpdateNodePoolError = (
  clusterId: number,
  nodePool: KubeNodePoolResponse,
  errorMessage: string = 'An unknown error occurred.',
  statusCode: number = 500
): Cypress.Chainable<null> => {
  return cy.intercept(
    'PUT',
    apiMatcher(`lke/clusters/${clusterId}/pools/${nodePool.id}`),
    makeErrorResponse(errorMessage, statusCode)
  );
};
