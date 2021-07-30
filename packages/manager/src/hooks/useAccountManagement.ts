import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State as ProfileState } from 'src/store/profile/profile.reducer';
import { Account, GlobalGrantTypes } from '@linode/api-v4/lib/account';
import { useAccount } from 'src/queries/account';
import { useAccountSettings } from 'src/queries/accountSettings';

export interface AccountManagementProps {
  account: Account;
  profile: ProfileState;
  _isRestrictedUser: boolean;
  _hasGrant: (grant: GlobalGrantTypes) => boolean;
  _hasAccountAccess: boolean;
  _isManagedAccount: boolean;
  _isLargeAccount: boolean;
}

export const useAccountManagement = () => {
  const { data: account } = useAccount();

  const profile = useSelector(
    (state: ApplicationState) => state.__resources.profile
  );

  const _isLargeAccount = useSelector(
    (state: ApplicationState) =>
      state.__resources.accountManagement.isLargeAccount
  );

  const { data: accountSettings } = useAccountSettings();

  const _isRestrictedUser = profile.data?.restricted ?? false;

  const _hasGrant = (grant: GlobalGrantTypes) =>
    profile.data?.grants?.global?.[grant] ?? false;

  const _hasAccountAccess = !_isRestrictedUser || _hasGrant('account_access');

  const _isManagedAccount = accountSettings?.managed ?? false;

  return {
    account,
    accountSettings,
    profile,
    _isRestrictedUser,
    _hasGrant,
    _hasAccountAccess,
    _isManagedAccount,
    _isLargeAccount,
  };
};

export default useAccountManagement;
