import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State as ProfileState } from 'src/store/profile/profile.reducer';
import { State as AccountState } from 'src/store/account/account.reducer';
import { State as AccountSettingsState } from 'src/store/accountSettings/accountSettings.reducer';
import { GlobalGrantTypes } from '@linode/api-v4/lib/account';

export interface AccountManagementProps {
  account: AccountState;
  profile: ProfileState;
  accountSettings: AccountSettingsState;
  _isRestrictedUser: boolean;
  _hasGrant: (grant: GlobalGrantTypes) => boolean;
  _hasAccountAccess: boolean;
  _isManagedAccount: boolean;
  _isLargeAccount: boolean;
}

export const useAccountManagement = () => {
  const profile = useSelector(
    (state: ApplicationState) => state.__resources.profile
  );

  const account = useSelector(
    (state: ApplicationState) => state.__resources.account
  );

  const accountSettings = useSelector(
    (state: ApplicationState) => state.__resources.accountSettings
  );

  const _isLargeAccount = useSelector(
    (state: ApplicationState) =>
      state.__resources.accountManagement.isLargeAccount
  );

  const _isRestrictedUser = profile.data?.restricted ?? false;

  const _hasGrant = (grant: GlobalGrantTypes) =>
    profile.data?.grants?.global?.[grant] ?? false;

  const _hasAccountAccess = !_isRestrictedUser || _hasGrant('account_access');

  const _isManagedAccount = accountSettings?.data?.managed ?? false;

  return {
    account,
    accountSettings,
    profile,
    _isRestrictedUser,
    _hasGrant,
    _hasAccountAccess,
    _isManagedAccount,
    _isLargeAccount
  };
};

export default useAccountManagement;
