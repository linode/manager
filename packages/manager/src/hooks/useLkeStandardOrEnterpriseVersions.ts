import { useIsLkeEnterpriseEnabled } from 'src/features/Kubernetes/kubeUtils';
import {
  useKubernetesTieredVersionsQuery,
  useKubernetesVersionQuery,
} from 'src/queries/kubernetes';

import type { KubernetesTier } from '@linode/api-v4';

/**
 * A hook to return the correct list of versions depending on the LKE cluster tier.
 * @param clusterTier Whether the cluster is standard or enterprise
 * @returns The list of either standard or enterprise k8 versions and query loading or error state
 */
export const useLkeStandardOrEnterpriseVersions = (
  clusterTier: KubernetesTier
) => {
  const { isLkeEnterpriseLAFeatureEnabled } = useIsLkeEnterpriseEnabled();

  /**
   * If LKE-E is enabled, use the data from the new /versions/<tier> endpoint for enterprise tiers.
   * If LKE-E is disabled, use the data from the existing /versions endpoint and disable the tiered query.
   */
  const {
    data: enterpriseTierVersions,
    error: enterpriseTierVersionsError,
    isLoading: enterpriseTierVersionsIsLoading,
  } = useKubernetesTieredVersionsQuery(
    'enterprise',
    isLkeEnterpriseLAFeatureEnabled
  );

  // TODO LKE-E: Replace this with the tiered version query for 'standard' versions after GA.
  const {
    data: _versions,
    error: versionsError,
    isLoading: versionsIsLoading,
  } = useKubernetesVersionQuery();

  return {
    isLoadingVersions: enterpriseTierVersionsIsLoading || versionsIsLoading,
    versions:
      isLkeEnterpriseLAFeatureEnabled && clusterTier === 'enterprise'
        ? enterpriseTierVersions
        : _versions,
    versionsError: enterpriseTierVersionsError || versionsError,
  };
};
