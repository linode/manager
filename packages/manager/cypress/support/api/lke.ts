import {
  deleteKubernetesCluster,
  getKubernetesClusters,
  getNodePools,
} from '@linode/api-v4';
import { DateTime } from 'luxon';
import { pageSize } from 'support/constants/api';
import { depaginate } from 'support/util/paginate';

import { isTestLabel } from './common';

import type {
  KubeNodePoolResponse,
  KubernetesCluster,
  PoolNodeResponse,
} from '@linode/api-v4';
import type { LinodeTypeClass } from '@linode/api-v4/lib/linodes/types';

/**
 * Describes an LKE plan as shown in Cloud Manager.
 */
export interface LkePlanDescription {
  /** Number of nodes in the plan. */
  nodeCount: number;
  /** Name of the plan. */
  planName: string;
  /** Plan size, GB. */
  size: number;
  /** Label for tab containing the plan in creation screen. */
  tab: string;
  /** Type of plan. */
  type: LinodeTypeClass;
}

export interface LkePlanDescriptionAPL extends LkePlanDescription {
  disabled: boolean;
}

/*
 * Determines if the given node pool is ready by checking the status of each node.
 */
const isPoolReady = (pool: KubeNodePoolResponse): boolean =>
  pool.nodes.every((node: PoolNodeResponse) => node.status === 'ready');

/**
 * Delete all LKE clusters whose labels are prefixed with "cy-test-".
 *
 * Sometimes when attempting to delete provisioning LKE clusters, the cluster
 * becomes stuck and requires manual intervention to resolve. To reduce the risk
 * of this happening, this function will only delete clusters that have finished
 * provisioning (i.e. all nodes have `'ready'` status) or which have existed
 * for at least an hour.
 *
 * @returns Promise that resolves when test LKE clusters have been deleted.
 */
export const deleteAllTestLkeClusters = async (): Promise<void> => {
  const clusters = await depaginate<KubernetesCluster>((page: number) =>
    getKubernetesClusters({ page, page_size: pageSize })
  );

  const clusterDeletionPromises = clusters
    .filter((cluster: KubernetesCluster) => isTestLabel(cluster.label))
    .map(async (cluster: KubernetesCluster) => {
      const clusterCreateTime = DateTime.fromISO(cluster.created, {
        zone: 'utc',
      });
      const createTimeElapsed = Math.abs(
        clusterCreateTime.diffNow('minutes').minutes
      );

      // If the test cluster is older than 1 hour, delete it regardless of
      // whether or not all of the Node Pools are ready; this is a safeguard
      // to prevent LKE clusters with stuck pools from accumulating.
      if (createTimeElapsed >= 60) {
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
      return;
    });

  await Promise.all(clusterDeletionPromises);
  return;
};
