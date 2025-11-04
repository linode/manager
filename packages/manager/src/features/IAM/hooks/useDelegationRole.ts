import { useProfile } from '@linode/queries';
import { useLocation } from '@tanstack/react-router';

import { useIsIAMDelegationEnabled } from './useIsIAMEnabled';

import type { UserType } from '@linode/api-v4';

type DelegationRole = {
  isChildAccount: boolean;
  isDefaultAccount: boolean;
  isDelegateAccount: boolean;
  isParentAccount: boolean;
  isProxyAccount: boolean;
  profileUserName: string | undefined;
  profileUserType: undefined | UserType;
};

export const useDelegationRole = (): DelegationRole => {
  const { data: profile } = useProfile();

  return {
    isProxyAccount: profile?.user_type === 'proxy',
    isDefaultAccount: profile?.user_type === 'default',
    isParentAccount: profile?.user_type === 'parent',
    isChildAccount: profile?.user_type === 'child',
    isDelegateAccount: profile?.user_type === 'delegate',
    profileUserType: profile?.user_type,
    profileUserName: profile?.username,
  };
};

/**
 * isDefaultDelegationRolesForChildAccount is true if:
 * - IAM Delegation is enabled for the account
 * - The current user is a child account
 * - The current route includes '/iam/roles/defaults'
 *
 * This flag is used to determine if the component should show or fetch/update delegated default roles
 * instead of regular user roles, and to adjust UI/logic for the delegate context.
 */
export const useIsDefaultDelegationRolesForChildAccount = () => {
  const { isIAMDelegationEnabled } = useIsIAMDelegationEnabled();
  const { isChildAccount } = useDelegationRole();
  const location = useLocation();

  return {
    isDefaultDelegationRolesForChildAccount:
      (isIAMDelegationEnabled &&
        isChildAccount &&
        location.pathname.includes('/iam/roles/defaults')) ??
      false,
  };
};
