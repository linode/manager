import { useProfile } from '@linode/queries';
import { useLocation } from '@tanstack/react-router';

import type { Profile, UserType } from '@linode/api-v4';

type DelegationRole = {
  isChildUserType: boolean;
  isDefaultUserType: boolean;
  isDelegateUserType: boolean;
  isParentUserType: boolean;
  isProfileLoading: boolean;
  profile: Profile | undefined;
  profileUserName: string | undefined;
  profileUserType: undefined | UserType;
};

export const useDelegationRole = (): DelegationRole => {
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  return {
    isDefaultUserType: profile?.user_type === 'default',
    isParentUserType: profile?.user_type === 'parent',
    isChildUserType: profile?.user_type === 'child',
    isDelegateUserType: profile?.user_type === 'delegate',
    profileUserType: profile?.user_type,
    profileUserName: profile?.username,
    profile,
    isProfileLoading,
  };
};

/**
 * isDefaultDelegationRolesForChildAccount is true if:
 * - The current user is a child or delegate account
 * - The current route includes '/iam/roles/defaults'
 *
 * This flag is used to determine if the component should show or fetch/update delegated default roles
 * instead of regular user roles, and to adjust UI/logic for the delegate context.
 */
export const useIsDefaultDelegationRolesForChildAccount = () => {
  const { isChildUserType, isDelegateUserType } = useDelegationRole();
  const location = useLocation();

  return {
    isDefaultDelegationRolesForChildAccount:
      ((isChildUserType || isDelegateUserType) &&
        location.pathname.includes('/iam/roles/defaults')) ??
      false,
  };
};
