import {
  iamQueries,
  useGetDefaultDelegationAccessQuery,
} from '@linode/queries';
import {
  useAccountRoles,
  useGetChildAccountsQuery,
  useProfile,
  useUserAccountPermissions,
} from '@linode/queries';
import { queryOptions } from '@tanstack/react-query';

import { useFlags } from 'src/hooks/useFlags';

import { useDelegationRole } from './useDelegationRole';

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
  if (!flags?.iam?.enabled || !profile) {
    return false;
  }

  try {
    if (profile.username) {
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
 * Returns whether or not features related to the IAM Delegation project should be enabled.
 */
export const useIsIAMDelegationEnabled = () => {
  const { isChildAccount, isParentAccount, isDelegateAccount } =
    useDelegationRole();
  const flags = useFlags();

  const { error: childAccountsError, isLoading: childAccountsLoading } =
    useGetChildAccountsQuery({
      enabled: isParentAccount,
    });

  const { error: defaultAccessError, isLoading: defaultAccessLoading } =
    useGetDefaultDelegationAccessQuery({
      enabled: isChildAccount,
    });

  const errors = [childAccountsError, defaultAccessError].filter(Boolean);

  const notFound = errors?.some(
    (e) => e?.[0]?.reason === 'Not found' || e?.[0]?.reason === 'Unauthorized'
  );

  const isLoading = childAccountsLoading || defaultAccessLoading;

  // Only enable if:
  // 1. Flag is enabled
  // 2. For delegates: always enable (they have delegation access)
  // 3. For parent/child accounts (non-delegates): enable only if queries completed and no "Not found"/"Unauthorized" errors
  const isIAMDelegationEnabled =
    flags.iamDelegation?.enabled &&
    (isDelegateAccount ||
      ((isParentAccount || isChildAccount) && !isLoading && !notFound));

  return {
    isLoading,
    isIAMDelegationEnabled,
  };
};
