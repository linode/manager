import { usePreferences } from 'src/queries/profile/preferences';

import { useIsAkamaiAccount } from './useIsAkamaiAccount';

import type { ManagerPreferences } from 'src/types/ManagerPreferences';

export const useSecureVMNoticesEnabled = () => {
  const { data: preferences } = usePreferences();
  const { isAkamaiAccount: isInternalAccount } = useIsAkamaiAccount();

  return {
    secureVMNoticesEnabled: getSecureVMNoticesEnabled(
      preferences,
      isInternalAccount
    ),
  };
};

const getSecureVMNoticesEnabled = (
  preferences?: ManagerPreferences,
  isInternalAccount?: boolean
) => {
  switch (preferences?.secure_vm_notices) {
    case 'always':
      return true;
    case 'never':
      return false;
    default:
      return isInternalAccount ?? false;
  }
};
