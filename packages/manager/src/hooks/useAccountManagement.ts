import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { State as AccountSettingsState } from 'src/store/accountSettings/accountSettings.reducer';
import { Account, GlobalGrantTypes } from '@linode/api-v4/lib/account';
import { useAccount } from 'src/queries/account';
import { Profile } from '@linode/api-v4/lib/profile';
import { useGrants, useProfile } from 'src/queries/profile';

export interface AccountManagementProps {
  account: Account;
  profile: Profile;
  accountSettings: AccountSettingsState;
  _isRestrictedUser: boolean;
  _hasGrant: (grant: GlobalGrantTypes) => boolean;
  _hasAccountAccess: boolean;
  _isManagedAccount: boolean;
  _isLargeAccount: boolean;
}

export const useAccountManagement = () => {
  const { data: account } = useAccount();
  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const accountSettings = useSelector(
    (state: ApplicationState) => state.__resources.accountSettings
  );

  const _isLargeAccount = useSelector(
    (state: ApplicationState) =>
      state.__resources.accountManagement.isLargeAccount
  );

  const _isRestrictedUser = profile?.restricted ?? false;

  const _hasGrant = (grant: GlobalGrantTypes) =>
    grants?.global?.[grant] ?? false;

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
    _isLargeAccount,
  };
};

export default useAccountManagement;
