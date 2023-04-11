import { LkePlanDescription } from 'support/api/lke';

/**
 * Subset of LKE cluster plans as shown on Cloud Manager.
 */
export const lkeClusterPlans: LkePlanDescription[] = [
  { type: 'Dedicated', size: 4, tab: 'Dedicated CPU' },
  { type: 'Dedicated', size: 8, tab: 'Dedicated CPU' },
  { type: 'Linode', size: 2, tab: 'Shared CPU' },
  { type: 'Linode', size: 4, tab: 'Shared CPU' },
  { type: 'Linode', size: 8, tab: 'Shared CPU' },
];

/**
 * Kubernetes versions available for cluster creation via Cloud Manager.
 */
export const kubernetesVersions = ['1.25', '1.24'];

/**
 * The latest Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestKubernetesVersion = kubernetesVersions[0];
