import type { CypressPlugin } from './plugin';
import type { ObjectStorageCluster, Region } from '@linode/api-v4';

/**
 * If applicable, checks whether the specified override test region is valid.
 *
 * If the specified region does not exist in the list of regions returned by the
 * Linode API, an error is thrown. Otherwise, a message is logged to the console
 * confirming that an override region is being used.
 */
export const regionOverrideCheck: CypressPlugin = (_on, config): void => {
  const overrideRegionId = config.env?.['CY_TEST_REGION'];
  const regions = (config.env['cloudManagerRegions'] || []) as Region[];

  if (overrideRegionId) {
    const foundRegion = regions.find(
      (region) => region.id === overrideRegionId
    );
    if (!foundRegion) {
      throw new Error(
        `Unable to find a region by ID '${overrideRegionId}'. Does the test account have access to this region?`
      );
    }
    console.info(
      `Running tests with region forced to '${foundRegion.id}' (${foundRegion.label}).`
    );
  }
};

/**
 * If applicable, checks whether the specified override test cluster is valid.
 *
 * If the specified cluster does not exist in the list of clusters returned by the
 * Linode API, an error is thrown. Otherwise, a message is logged to the console
 * confirming that an override cluster is being used.
 */
export const clusterOverrideCheck: CypressPlugin = (_on, config): void => {
  const overrideClusterId = config.env?.['CY_TEST_CLUSTER'];
  const clusters = (config.env['cloudManagerClusters'] ||
    []) as ObjectStorageCluster[];

  if (overrideClusterId) {
    const foundCluster = clusters.find(
      (cluster) => cluster.id === overrideClusterId
    );
    if (!foundCluster) {
      throw new Error(
        `Unable to find a cluster by ID '${overrideClusterId}'. Does the test account have access to this cluster?`
      );
    }
    console.info(
      `Running tests with cluster forced to '${foundCluster.id}' (${foundCluster.region}).`
    );
  }
};
