import { getLatestKubernetesVersion } from 'support/util/lke';

import type { KubernetesTieredVersion } from '@linode/api-v4';

/**
 * Kubernetes versions available for cluster creation via Cloud Manager.
 */
export const kubernetesVersions = ['1.31', '1.30'];

/**
 * Enterprise kubernetes versions available for cluster creation via Cloud Manager.
 */
export const enterpriseKubernetesVersions = ['v1.31.1+lke1'];

/**
 * The latest Kubernetes version available for cluster creation via Cloud Manager.
 */
export const latestKubernetesVersion =
  getLatestKubernetesVersion(kubernetesVersions);

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
  id: getLatestKubernetesVersion(enterpriseKubernetesVersions),
  tier: 'enterprise',
};
