import { useAccountRoles } from '@linode/queries';

import { useFlags } from 'src/hooks/useFlags';

/**
 * Hook to determine if the IAM feature is enabled for the current user.
 *
 * @returns {boolean} - Whether the IAM feature is enabled for the current user.
 */
export const useIsIAMEnabled = () => {
  const flags = useFlags();
  const { data: accountRoles } = useAccountRoles(flags.iam?.enabled);

  const hasAccountAccess = accountRoles?.account_access?.length;
  const hasEntityAccess = accountRoles?.entity_access?.length;

  return {
    isIAMBeta: flags.iam?.beta,
    isIAMEnabled: Boolean(
      flags.iam?.enabled && (hasAccountAccess || hasEntityAccess)
    ),
  };
};
