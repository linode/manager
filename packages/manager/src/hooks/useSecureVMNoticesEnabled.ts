import { usePreferences } from '@linode/queries';

import { useFlags } from './useFlags';
import { useIsAkamaiAccount } from './useIsAkamaiAccount';

import type { ManagerPreferences } from '@linode/utilities';
import type { FlagSet } from 'src/featureFlags';

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
