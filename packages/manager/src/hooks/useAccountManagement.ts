import { Account, GlobalGrantTypes } from '@linode/api-v4/lib/account';
import { Profile } from '@linode/api-v4/lib/profile';
import { useSelector } from 'react-redux';

import { useAccount } from 'src/queries/account';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useGrants, useProfile } from 'src/queries/profile';
import { ApplicationState } from 'src/store';

export interface AccountManagementProps {
  _hasAccountAccess: boolean;
  _hasGrant: (grant: GlobalGrantTypes) => boolean;
  _isLargeAccount: boolean;
  _isManagedAccount: boolean;
  _isRestrictedUser: boolean;
  account: Account;
  profile: Profile;
}

export const useAccountManagement = () => {
  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const _isLargeAccount = useSelector(
    (state: ApplicationState) =>
      state.__resources.accountManagement.isLargeAccount
  );

  const _isRestrictedUser = profile?.restricted ?? false;
  const { data: accountSettings } = useAccountSettings();

  const _hasGrant = (grant: GlobalGrantTypes) =>
    grants?.global?.[grant] ?? false;

  const _hasAccountAccess = !_isRestrictedUser || _hasGrant('account_access');

  const _isManagedAccount = accountSettings?.managed ?? false;

  return {
    _hasAccountAccess,
    _hasGrant,
    _isLargeAccount,
    _isManagedAccount,
    _isRestrictedUser,
    account,
    accountSettings,
    profile,
  };
};

export default useAccountManagement;
