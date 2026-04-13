import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';

export const useIsServerlessInferenceEnabled = (): {
  isServerlessInferenceEnabled: boolean;
} => {
  const { data: account } = useAccount();
  const flags = useFlags();

  if (!flags) {
    return { isServerlessInferenceEnabled: false };
  }

  const isServerlessInferenceEnabled = isFeatureEnabledV2(
    'AI',
    Boolean(flags.serverlessInference),
    account?.capabilities ?? []
  );

  return { isServerlessInferenceEnabled };
};
