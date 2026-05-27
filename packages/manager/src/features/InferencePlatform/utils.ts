import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';

export const useIsInferencePlatformEnabled = (): {
  isInferencePlatformEnabled: boolean;
} => {
  const { data: account } = useAccount();
  const flags = useFlags();

  if (!flags) {
    return { isInferencePlatformEnabled: false };
  }

  const isInferencePlatformEnabled = isFeatureEnabledV2(
    'AI',
    Boolean(flags.inferencePlatform),
    account?.capabilities ?? []
  );

  return { isInferencePlatformEnabled };
};
