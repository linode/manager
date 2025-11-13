import { iamQueries } from '@linode/queries';
import {
  useAccountRoles,
  useProfile,
  useUserAccountPermissions,
} from '@linode/queries';
import { queryOptions } from '@tanstack/react-query';

import { useFlags } from 'src/hooks/useFlags';

import type { Profile } from '@linode/api-v4';
import type { QueryClient } from '@tanstack/react-query';
import type { FlagSet } from 'src/featureFlags';

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
    isIAMBeta: flags.iam?.beta,
    isIAMEnabled: flags?.iam?.enabled && Boolean(roles || permissions),
    isLoading: isLoadingRoles || isLoadingPermissions,
    accountRoles: roles,
    profile,
  };
};

/**
 * This function is an alternative to the useIsIAMEnabled hook to be used in our router's beforeLoad functions.
 * The logic is identical, but here we fetch at the router level instead of the hook level.
 * This does not over-fetch data since the components will do a cache lookup in subsequent renders.
 * This is only used in a a few routes for iam/account specific redirect purposes.
 *
 * NOTE: we could use this in the `loader` method (instead of `beforeLoad`) and have the component use the `useLoaderData` hook,
 * but there isn't at the moment a big advantage of doing that since these are isolated routes.
 */
export const checkIAMEnabled = async (
  queryClient: QueryClient,
  flags: FlagSet,
  profile: Profile | undefined
): Promise<boolean> => {
  if (!flags?.iam?.enabled) {
    return false;
  }

  try {
    if (profile?.username) {
      // For restricted users ONLY, get permissions
      const permissions = await queryClient.ensureQueryData(
        queryOptions(iamQueries.user(profile.username)._ctx.accountPermissions)
      );
      return Boolean(permissions);
    }

    // For non-restricted users ONLY, get roles
    const roles = await queryClient.ensureQueryData(
      queryOptions(iamQueries.accountRoles)
    );

    return Boolean(roles);
  } catch {
    return false;
  }
};

/**
 * Returns whether or not features related to the IAM Delegation project
 * should be enabled.
 */
export const useIsIAMDelegationEnabled = () => {
  const flags = useFlags();

  return { isIAMDelegationEnabled: flags.iamDelegation?.enabled ?? false };
};
