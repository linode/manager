import { GlobalGrantTypes } from '@linode/api-v4/lib/account';

import { useAccount } from 'src/queries/account';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useGrants, useProfile } from 'src/queries/profile';

export const useAccountManagement = () => {
  const { data: account, error: accountError } = useAccount({});
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const _isRestrictedUser = profile?.restricted ?? false;
  const { data: accountSettings } = useAccountSettings();

  const _hasGrant = (grant: GlobalGrantTypes) =>
    grants?.global?.[grant] ?? false;

  const _hasAccountAccess = !_isRestrictedUser || _hasGrant('account_access');

  const _isManagedAccount = accountSettings?.managed ?? false;

  return {
    _hasAccountAccess,
    _hasGrant,
    _isManagedAccount,
    _isRestrictedUser,
    account,
    accountError,
    accountSettings,
    profile,
  };
};
