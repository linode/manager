import { useProfile } from '@linode/queries';

import type { UserType } from '@linode/api-v4';

type DelegationRole = {
  isChildAccount: boolean;
  isDefaultUser: boolean;
  isDelegateUser: boolean;
  isParentAccount: boolean;
  isProxyUser: boolean;
  profileUserName: string | undefined;
  profileUserType: undefined | UserType;
};

export const useDelegationRole = (): DelegationRole => {
  const { data: profile } = useProfile();

  return {
    isProxyUser: profile?.user_type === 'proxy',
    isDefaultUser: profile?.user_type === 'default',
    isParentAccount: profile?.user_type === 'parent',
    isChildAccount: profile?.user_type === 'child',
    isDelegateUser: profile?.user_type === 'delegate',
    profileUserType: profile?.user_type,
    profileUserName: profile?.username,
  };
};
