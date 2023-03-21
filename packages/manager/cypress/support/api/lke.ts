import type { KubernetesCluster } from '@linode/api-v4/types';
import {
  getKubernetesClusters,
  deleteKubernetesCluster,
} from '@linode/api-v4/lib/kubernetes';
import { depaginate } from 'support/util/paginate';
import { isTestLabel } from './common';

/**
 * Describes an LKE plan as shown in Cloud Manager.
 */
export interface LkePlanDescription {
  /// Type of plan.
  type: string;

  /// Plan size, GB.
  size: number;

  /// Label for tab containing the plan in creation screen.
  tab: string;
}

export const deleteAllTestLkeClusters = async (): Promise<any[]> => {
  const clusters = await depaginate<KubernetesCluster>((page: number) =>
    getKubernetesClusters({ page_size: 500, page })
  );

  const clusterDeletionPromises = clusters
    .filter((cluster) => isTestLabel(cluster.label))
    .map((cluster) => deleteKubernetesCluster(cluster.id));

  return Promise.all(clusterDeletionPromises);
};
