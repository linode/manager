import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';

/**
 * Hook to determine if the Disk Encryption feature should be visible to the user.
 * Based on the user's account capability and the feature flag.
 *
 * @returns { boolean } - Whether the Disk Encryption feature is enabled for the current user.
 */
export const useIsDiskEncryptionFeatureEnabled = (): {
  isDiskEncryptionFeatureEnabled: boolean;
} => {
  const { data: account, error } = useAccount();
  const flags = useFlags();

  if (error || !flags) {
    return { isDiskEncryptionFeatureEnabled: false };
  }

  const hasAccountCapability = account?.capabilities?.includes(
    'Disk Encryption'
  );

  const isFeatureFlagEnabled = flags.linodeDiskEncryption;

  const isDiskEncryptionFeatureEnabled = Boolean(
    hasAccountCapability && isFeatureFlagEnabled
  );

  return { isDiskEncryptionFeatureEnabled };
};

/**
 * Hook to determine if the Block Storage Encryption feature should be visible to the user.
 * Based on the user's account capability and the feature flag.
 *
 * @returns { boolean } - Whether the Block Storage Encryption feature is enabled for the current user.
 */
export const useIsBlockStorageEncryptionFeatureEnabled = (): {
  isBlockStorageEncryptionFeatureEnabled: boolean;
} => {
  const { data: account, error } = useAccount();
  const flags = useFlags();

  if (error || !flags) {
    return { isBlockStorageEncryptionFeatureEnabled: false };
  }

  const hasAccountCapability = account?.capabilities?.includes(
    'Block Storage Encryption'
  );

  const isFeatureFlagEnabled = flags.blockStorageEncryption;

  const isBlockStorageEncryptionFeatureEnabled = Boolean(
    hasAccountCapability && isFeatureFlagEnabled
  );

  return { isBlockStorageEncryptionFeatureEnabled };
};
