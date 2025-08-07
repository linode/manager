import { iamQueries, profileQueries } from '@linode/queries';
import {
  useAccountRoles,
  useProfile,
  useUserAccountPermissions,
} from '@linode/queries';

import { useFlags } from 'src/hooks/useFlags';

import type { IamAccountRoles, PermissionType, Profile } from '@linode/api-v4';
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
  flags: FlagSet
): Promise<boolean> => {
  if (!flags?.iam?.enabled) {
    return false;
  }

  const profile: Profile | undefined = await queryClient.getQueryData(
    profileQueries.profile().queryKey
  );

  if (!profile) {
    return false;
  }

  let roles: IamAccountRoles | undefined;
  let permissions: PermissionType[] | undefined;

  // For non-restricted users ONLY, get roles
  if (!profile.restricted) {
    roles = await queryClient.getQueryData(iamQueries.accountRoles.queryKey);

    if (!roles) {
      try {
        roles = await queryClient.fetchQuery({
          queryKey: iamQueries.accountRoles.queryKey,
          queryFn: iamQueries.accountRoles.queryFn,
        });
      } catch {
        return false;
      }
    }
    // Don't fetch permissions for non-restricted users
  } else {
    // For restricted users ONLY, get permissions
    permissions = await queryClient.getQueryData(
      iamQueries.user(profile.username)._ctx.accountPermissions.queryKey
    );

    if (!permissions) {
      try {
        permissions = await queryClient.fetchQuery({
          queryKey: iamQueries.user(profile.username)._ctx.accountPermissions
            .queryKey,
          queryFn: iamQueries.user(profile.username)._ctx.accountPermissions
            .queryFn,
        });
      } catch {
        return false;
      }
    }
  }

  return Boolean(roles || permissions?.length);
};
