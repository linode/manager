import { useAccountSettings, useProfile } from '@linode/queries';

import { useIsIAMEnabled } from 'src/features/IAM/hooks/useIsIAMEnabled';
import { useSetupFeatureFlags } from 'src/useSetupFeatureFlags';

/**
 * Blocks app shell render until feature flags, profile, account settings, and
 * IAM mode are ready. Router context and beforeLoad can read these synchronously.
 */
export const useAppShellBootstrap = (enabled = true) => {
  const { areFeatureFlagsLoading } = useSetupFeatureFlags();
  const { isPending: isProfilePending } = useProfile();
  const { isPending: isAccountSettingsPending } = useAccountSettings();
  const { isLoading: isIamModeLoading } = useIsIAMEnabled();

  const isAppShellLoading =
    enabled &&
    (areFeatureFlagsLoading ||
      isProfilePending ||
      isAccountSettingsPending ||
      isIamModeLoading);

  return { isAppShellLoading };
};
