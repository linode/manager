import type { KubernetesTieredVersion } from '@linode/api-v4';
import type { LkePlanDescription } from 'support/api/lke';

/**
 * Subset of LKE cluster plans as shown on Cloud Manager.
 */
export const lkeClusterPlans: LkePlanDescription[] = [
  { size: 4, tab: 'Dedicated CPU', type: 'Dedicated' },
  { size: 2, tab: 'Shared CPU', type: 'Linode' },
  { size: 4, tab: 'Shared CPU', type: 'Linode' },
];

/**
 * Kubernetes versions available for cluster creation via Cloud Manager.
 */
export const kubernetesVersions = ['1.25', '1.24'];

/**
 * Enterprise kubernetes versions available for cluster creation via Cloud Manager.
 */
export const enterpriseKubernetesVersions = ['v1.31.1+lke1'];

/**
 * The latest Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestKubernetesVersion = kubernetesVersions[0];

/**
 * The latest standard tier Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestStandardTierKubernetesVersion: KubernetesTieredVersion = {
  id: latestKubernetesVersion,
  tier: 'standard',
};

/**
 * The latest enterprise tier Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestEnterpriseTierKubernetesVersion: KubernetesTieredVersion = {
  id: enterpriseKubernetesVersions[0],
  tier: 'enterprise',
};
