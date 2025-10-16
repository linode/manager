import { useProfile } from '@linode/queries';

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
