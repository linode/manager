import { useFlags } from 'src/hooks/useFlags';
import { useAccountPermissions } from 'src/queries/iam/iam';

/**
 * Hook to determine if the IAM feature is enabled for the current user.
 *
 * @returns {boolean} - Whether the IAM feature is enabled for the current user.
 */
export const useIsIAMEnabled = () => {
  const flags = useFlags();
  const { data: rolePermissions } = useAccountPermissions(flags.iam?.enabled);

  const hasAccountAccess = rolePermissions?.account_access?.length;
  const hasEntityAccess = rolePermissions?.entity_access?.length;

  return {
    isIAMBeta: flags.iam?.beta,
    isIAMEnabled: Boolean(
      flags.iam?.enabled && (hasAccountAccess || hasEntityAccess)
    ),
  };
};
