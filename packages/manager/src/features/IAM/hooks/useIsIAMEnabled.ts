import {
  useAccountRoles,
  useProfile,
  useUserAccountPermissions,
} from '@linode/queries';

import { useFlags } from 'src/hooks/useFlags';

/**
 * Hook to determine if the IAM feature is enabled for the current user.
 *
 * @returns {boolean} - Whether the IAM feature is enabled for the current user.
 */
export const useIsIAMEnabled = () => {
  const flags = useFlags();
  const { data: profile } = useProfile();
  const { data: roles, isLoading: isLoadingRoles } = useAccountRoles(
    flags?.iam?.enabled === true && !profile?.restricted
  );

  const { data: permissions, isLoading: isLoadingPermissions } =
    useUserAccountPermissions(flags?.iam?.enabled === true);

  return {
    isIAMEnabled: flags?.iam?.enabled && Boolean(roles || permissions),
    isLoading: isLoadingRoles || isLoadingPermissions,
    accountRoles: roles,
    profile,
  };
};
