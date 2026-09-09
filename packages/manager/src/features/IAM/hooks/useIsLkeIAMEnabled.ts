import { useFlags } from 'src/hooks/useFlags';

import { useIsIAMEnabled } from './useIsIAMEnabled';

/**
 * Whether LKE IAM RBAC is active for permission checks.
 * Requires global IAM and the LKE product flag (`iamLKE`).
 */
export const useIsLkeIAMEnabled = () => {
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();

  return {
    isLkeIAMEnabled: flags.iamLKE === true && isIAMEnabled,
  };
};
