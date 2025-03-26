import { usePreferences } from 'src/queries/profile/preferences';

import { useFlags } from './useFlags';
import { useIsAkamaiAccount } from './useIsAkamaiAccount';

import type { FlagSet } from 'src/featureFlags';
import type { ManagerPreferences } from 'src/types/ManagerPreferences';

export const useSecureVMNoticesEnabled = () => {
  const { data: secureVMsNoticePreference } = usePreferences(
    (preferences) => preferences?.secure_vm_notices
  );
  const { isAkamaiAccount: isInternalAccount } = useIsAkamaiAccount();
  const flags = useFlags();

  return {
    secureVMNoticesEnabled: getSecureVMNoticesEnabled(
      secureVMsNoticePreference,
      isInternalAccount,
      flags
    ),
  };
};

const getSecureVMNoticesEnabled = (
  preference: ManagerPreferences['secure_vm_notices'] | undefined,
  isInternalAccount: boolean | undefined,
  flags: FlagSet
) => {
  if (Object.keys(flags.secureVmCopy ?? {}).length === 0) {
    return false;
  }
  switch (preference) {
    case 'always':
      return true;
    case 'never':
      return false;
    default:
      return isInternalAccount ?? false;
  }
};
