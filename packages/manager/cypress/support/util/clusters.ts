import { randomItem } from 'support/util/random';

import type { ObjectStorageCluster } from '@linode/api-v4';
/**
 * Returns a known Cloud Manager cluster at random, or returns a user-chosen
 * cluster if one was specified.
 *
 * Cluster selection can be overridden via the `CY_TEST_CLUSTER` environment
 * variable.
 *
 * @returns Object describing a Cloud Manager cluster to use during tests.
 */
export const chooseCluster = (): ObjectStorageCluster => {
  return randomItem(resolveSearchClusters());
};

/**
 * Returns an object describing a Cloud Manager cluster if specified by the user.
 *
 * If the user has not specified an override cluster to use, `undefined` is
 * returned.
 *
 * @returns Override Cloud Manager cluster, or `undefined`.
 */
export const getOverrideCluster = (): ObjectStorageCluster | undefined => {
  const overrideClusterId = Cypress.env('CY_TEST_CLUSTER');

  try {
    return getClusterById(overrideClusterId);
  } catch (_e) {
    return undefined;
  }
};

/**
 * Returns an object describing a Cloud Manager cluster with the given ID.
 *
 * If no known cluster exists with the given ID, an error is thrown.
 *
 * @param id - ID of the cluster to find.
 * @param searchClusters - Optional array of Clusters from which to search.
 *
 * @throws When no cluster exists in the `clusters` array with the given ID.
 *
 * @returns Extended Cloud Manager Cluster instance for cluster with the given ID.
 */
export const getClusterById = (
  id: string,
  searchClusters?: ObjectStorageCluster[]
): ObjectStorageCluster => {
  const cluster = (searchClusters ?? clusters).find(
    (findCluster: ObjectStorageCluster) => findCluster.id === id
  );
  if (!cluster) {
    throw new Error(`Unable to find cluster by ID. Unknown ID '${id}'.`);
  }
  return cluster;
};

/**
 * All Linode clusters available to the current Cloud Manager user.
 *
 * Retrieved via Linode APIv4 during Cypress start-up.
 */
export const clusters: ObjectStorageCluster[] = Cypress.env(
  'cloudManagerClusters'
) as ObjectStorageCluster[];

/**
 * Returns an array of cluster objects that meet the given criteria.
 *
 * @returns Array of ObjectStorageCluster objects.
 */
const resolveSearchClusters = (): ObjectStorageCluster[] => {
  const overrideCluster = getOverrideCluster();
  if (overrideCluster) {
    return [overrideCluster];
  }
  return clusters;
};
