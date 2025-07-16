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
  const { data: roles } = useAccountRoles(
    flags?.iam?.enabled === true && !profile?.restricted
  );

  const { data: permissions } = useUserAccountPermissions(
    flags?.iam?.enabled === true
  );

  return {
    isIAMBeta: flags.iam?.beta,
    isIAMEnabled: flags?.iam?.enabled && Boolean(roles || permissions?.length),
  };
};
