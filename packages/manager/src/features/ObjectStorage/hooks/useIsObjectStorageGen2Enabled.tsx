import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';

/**
 * Hook to determine if the Object Storage Gen2 feature should be visible to the user.
 * Based on the user's account capability and the feature flag.
 *
 * @returns {boolean} - Whether the Object Storage Gen2 feature is enabled for the current user.
 */
export const useIsObjectStorageGen2Enabled = (): {
  isObjectStorageGen2Enabled: boolean;
} => {
  const { data: account } = useAccount();
  const flags = useFlags();

  const isObjectStorageGen2Enabled = isFeatureEnabledV2(
    'Object Storage Endpoint Types',
    Boolean(flags.objectStorageGen2?.enabled),
    account?.capabilities ?? []
  );

  return { isObjectStorageGen2Enabled };
};

export const useIsObjMultiClusterEnabled = () => {
  const flags = useFlags();
  const { data: account } = useAccount();

  const isObjMultiClusterEnabled = isFeatureEnabledV2(
    'Object Storage Access Key Regions',
    Boolean(flags.objMultiCluster),
    account?.capabilities ?? []
  );

  return { isObjMultiClusterEnabled };
};
