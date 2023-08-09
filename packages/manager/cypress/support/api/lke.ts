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
      const pools = await depaginate<KubeNodePoolResponse>((page: number) =>
        getNodePools(cluster.id, { page, page_size: pageSize })
      );
      // Only delete clusters that have finished provisioning.
      if (pools.every(isPoolReady)) {
        return deleteKubernetesCluster(cluster.id);
      }
    });

  await Promise.all(clusterDeletionPromises);
  return;
};
