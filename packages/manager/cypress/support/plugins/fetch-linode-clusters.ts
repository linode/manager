import { getClusters } from '@linode/api-v4';

import type { CypressPlugin } from './plugin';
import type { ObjectStorageCluster, ResourcePage } from '@linode/api-v4';

/**
 * Fetches Linode clusters and stores data in Cypress `cloudManagerClusters` env.
 *
 * Throws an error if no OAuth token (used for regions API request) is defined.
 */
export const fetchLinodeClusters: CypressPlugin = async (on, config) => {
  const clusters: ResourcePage<ObjectStorageCluster> = await getClusters({
    page_size: 500,
  });
  return {
    ...config,
    env: {
      ...config.env,
      cloudManagerClusters: clusters.data,
    },
  };
};
