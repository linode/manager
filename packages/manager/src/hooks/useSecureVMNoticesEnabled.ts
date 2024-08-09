import { usePreferences } from 'src/queries/profile/preferences';

import { useFlags } from './useFlags';
import { useIsAkamaiAccount } from './useIsAkamaiAccount';

import type { FlagSet } from 'src/featureFlags';
import type { ManagerPreferences } from 'src/types/ManagerPreferences';

export const useSecureVMNoticesEnabled = () => {
  const { data: preferences } = usePreferences();
  const { isAkamaiAccount: isInternalAccount } = useIsAkamaiAccount();
  const flags = useFlags();

  return {
    secureVMNoticesEnabled: getSecureVMNoticesEnabled(
      preferences,
      isInternalAccount,
      flags
    ),
  };
};

const getSecureVMNoticesEnabled = (
  preferences: ManagerPreferences | undefined,
  isInternalAccount: boolean | undefined,
  flags: FlagSet
) => {
  if (Object.keys(flags.secureVmCopy ?? {}).length === 0) {
    return false;
  }
  switch (preferences?.secure_vm_notices) {
    case 'always':
      return true;
    case 'never':
      return false;
    default:
      return isInternalAccount ?? false;
  }
};
