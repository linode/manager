import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';
import { isFeatureEnabledV2 } from 'src/utilities/accountCapabilities';

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
