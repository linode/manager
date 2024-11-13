import type { LkePlanDescriptionAPL } from 'support/api/lke';

/**
 * Subset of hand-picked LKE cluster plans that should be disabled when APL is active.
 */
export const lkeClusterPlansAPL: LkePlanDescriptionAPL[] = [
  {
    disabled: true,
    nodeCount: 3,
    size: 4,
    tab: 'Dedicated CPU',
    type: 'Dedicated',
  },
  {
    disabled: false,
    nodeCount: 3,
    size: 8,
    tab: 'Dedicated CPU',
    type: 'Dedicated',
  },
  { disabled: true, nodeCount: 3, size: 2, tab: 'Shared CPU', type: 'Linode' },
  {
    disabled: true,
    nodeCount: 3,
    size: 24,
    tab: 'High Memory',
    type: 'Linode',
  },
];

/**
 * Kubernetes versions available for cluster creation via Cloud Manager.
 */
export const kubernetesVersions = ['1.25', '1.24'];

/**
 * The latest Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestKubernetesVersion = kubernetesVersions[0];
