import { useAccount } from '@linode/queries';

import { useFlags } from 'src/hooks/useFlags';

import {
  ENCRYPT_DISK_DISABLED_REBUILD_DISTRIBUTED_REGION_REASON,
  ENCRYPT_DISK_DISABLED_REBUILD_LKE_REASON,
  ENCRYPT_DISK_REBUILD_DISTRIBUTED_COPY,
  ENCRYPT_DISK_REBUILD_LKE_COPY,
  ENCRYPT_DISK_REBUILD_STANDARD_COPY,
} from './constants';

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

interface RebuildEncryptionDescriptionOptions {
  isLKELinode: boolean;
  isLinodeInDistributedRegion: boolean;
}

export function getRebuildDiskEncryptionDescription(
  options: RebuildEncryptionDescriptionOptions
) {
  if (options.isLinodeInDistributedRegion) {
    return ENCRYPT_DISK_REBUILD_DISTRIBUTED_COPY;
  }

  if (options.isLKELinode) {
    return ENCRYPT_DISK_REBUILD_LKE_COPY;
  }

  return ENCRYPT_DISK_REBUILD_STANDARD_COPY;
}

interface DiskEncryptionDisabledInRebuildFlowOptions {
  isLKELinode: boolean | undefined;
  isLinodeInDistributedRegion: boolean;
  regionSupportsDiskEncryption: boolean;
}

export const getDiskEncryptionDisabledInRebuildReason = (
  options: DiskEncryptionDisabledInRebuildFlowOptions
) => {
  if (options.isLinodeInDistributedRegion) {
    return ENCRYPT_DISK_DISABLED_REBUILD_DISTRIBUTED_REGION_REASON;
  }

  if (options.isLKELinode) {
    return ENCRYPT_DISK_DISABLED_REBUILD_LKE_REASON;
  }

  if (!options.regionSupportsDiskEncryption) {
    return "Disk encryption is not available in this Linode's region.";
  }

  return undefined;
};
