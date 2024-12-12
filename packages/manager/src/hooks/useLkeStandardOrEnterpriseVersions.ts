import { useIsLkeEnterpriseEnabled } from 'src/features/Kubernetes/kubeUtils';
import {
  useKubernetesTieredVersionsQuery,
  useKubernetesVersionQuery,
} from 'src/queries/kubernetes';

import type { KubernetesTier } from '@linode/api-v4';

export const useLkeStandardOrEnterpriseVersions = (
  clusterTier: KubernetesTier
) => {
  const { isLkeEnterpriseLAFeatureEnabled } = useIsLkeEnterpriseEnabled();
  const { data: enterpriseTieredVersions } = useKubernetesTieredVersionsQuery(
    'enterprise'
  );
  const { data: versions } = useKubernetesVersionQuery();

  return isLkeEnterpriseLAFeatureEnabled && clusterTier === 'enterprise'
    ? enterpriseTieredVersions
    : versions;
};
