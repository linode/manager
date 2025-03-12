import {
  useAccount,
  useAccountSettings,
  useGrants,
  useProfile,
} from '@linode/queries';

import { useRestrictedGlobalGrantCheck } from './useRestrictedGlobalGrantCheck';

import type { GlobalGrantTypes } from '@linode/api-v4/lib/account';

export const useAccountManagement = () => {
  const { data: account, error: accountError } = useAccount();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const isRestrictedGlobalGrant = useRestrictedGlobalGrantCheck({
    globalGrantType: 'child_account_access',
  });

  const _isRestrictedUser = profile?.restricted ?? false;
  const { data: accountSettings } = useAccountSettings();

  const _hasGrant = (grant: GlobalGrantTypes) =>
    grants?.global?.[grant] ?? false;

  const _hasAccountAccess = !_isRestrictedUser || _hasGrant('account_access');

  const _isManagedAccount = accountSettings?.managed ?? false;

  const hasReadWriteAccess = _hasGrant('account_access') === 'read_write';

  const canSwitchBetweenParentOrProxyAccount =
    (profile?.user_type === 'parent' && !isRestrictedGlobalGrant) ||
    profile?.user_type === 'proxy';

  return {
    _hasAccountAccess,
    _hasGrant,
    _isManagedAccount,
    _isRestrictedUser,
    account,
    accountError,
    accountSettings,
    canSwitchBetweenParentOrProxyAccount,
    hasReadWriteAccess,
    profile,
  };
};
