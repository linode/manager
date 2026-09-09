import { useFlags } from 'src/hooks/useFlags';

import { useIsIAMEnabled } from './useIsIAMEnabled';

/**
 * Whether Quotas IAM RBAC is active for permission checks.
 * Requires global IAM and the Quotas product flag.
 */
export const useIsQuotasEnabled = () => {
  const flags = useFlags();
  const { isIAMEnabled } = useIsIAMEnabled();

  return {
    isQuotasEnabled: Boolean(flags.iamQuotas) && isIAMEnabled,
  };
};
