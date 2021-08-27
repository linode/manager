import { useSelector } from 'react-redux';
import { ApplicationState } from 'src/store';
import { Profile } from '@linode/api-v4/lib/profile';
import { Agreements } from '@linode/api-v4/lib/account';
import { useGrants, useProfile } from 'src/queries/profile';
import { Account, GlobalGrantTypes } from '@linode/api-v4/lib/account';
import { useAccount } from 'src/queries/account';
import { useAccountSettings } from 'src/queries/accountSettings';
import { useAccountAgreements } from 'src/queries/accountAgreements';

export interface AccountManagementProps {
  account: Account;
  agreements: Agreements;
  profile: Profile;
  _isRestrictedUser: boolean;
  _hasGrant: (grant: GlobalGrantTypes) => boolean;
  _hasAccountAccess: boolean;
  _isManagedAccount: boolean;
  _isLargeAccount: boolean;
}

export const useAccountManagement = () => {
  const { data: account } = useAccount();
  const { data: accountAgreements } = useAccountAgreements();
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
    account,
    accountSettings,
    accountAgreements,
    profile,
    _isRestrictedUser,
    _hasGrant,
    _hasAccountAccess,
    _isManagedAccount,
    _isLargeAccount,
  };
};

export default useAccountManagement;
