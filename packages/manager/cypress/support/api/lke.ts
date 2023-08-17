import {
  KubeNodePoolResponse,
  KubernetesCluster,
  PoolNodeResponse,
  deleteKubernetesCluster,
  getKubernetesClusters,
  getNodePools,
} from '@linode/api-v4';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';
import { DateTime } from 'luxon';

import { isTestLabel } from './common';

/**
 * Describes an LKE plan as shown in Cloud Manager.
 */
export interface LkePlanDescription {
  // / Plan size, GB.
  size: number;

  // / Label for tab containing the plan in creation screen.
  tab: string;

  // / Type of plan.
  type: string;
}

/*
 * Determines if the given node pool is ready by checking the status of each node.
 */
const isPoolReady = (pool: KubeNodePoolResponse): boolean =>
  pool.nodes.every((node: PoolNodeResponse) => node.status === 'ready');

/**
 * Delete all LKE clusters whose labels are prefixed with "cy-test-".
 *
 * @returns Promise that resolves when test LKE clusters have been deleted.
 */
export const deleteAllTestLkeClusters = async (): Promise<void> => {
  const clusters = await depaginate<KubernetesCluster>((page: number) =>
    getKubernetesClusters({ page, page_size: pageSize })
  );

  const clusterDeletionPromises = clusters
    .filter((cluster) => isTestLabel(cluster.label))
    .map(async (cluster) => {
      const clusterCreateTime = DateTime.fromISO(cluster.created);

      // If the test cluster is older than 1 hour, delete it regardless of
      // whether or not all of the Node Pools are ready; this is a safeguard
      // to prevent LKE clusters with stuck pools from accumulating.
      if (clusterCreateTime.diffNow().hours >= 1) {
        return deleteKubernetesCluster(cluster.id);
      }

      // If the cluster is not older than 1 hour, only delete it if all of its
      // Node Pools are ready.
      const pools = await depaginate<KubeNodePoolResponse>((page: number) =>
        getNodePools(cluster.id, { page, page_size: pageSize })
      );
      if (pools.every(isPoolReady)) {
        return deleteKubernetesCluster(cluster.id);
      }
    });

  await Promise.all(clusterDeletionPromises);
  return;
};
