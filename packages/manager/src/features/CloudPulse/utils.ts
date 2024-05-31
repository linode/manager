import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account/account';

export const useIsACLPEnabled = (): {
  isACLPEnabled: boolean;
} => {
  const { data: account, error } = useAccount();
  const flags = useFlags();

  if (error || !flags) {
    return { isACLPEnabled: false };
  }

  const hasAccountCapability = account?.capabilities?.includes('CloudPulse');
  const isFeatureFlagEnabled = flags.aclp?.enabled;

  const isACLPEnabled = Boolean(hasAccountCapability && isFeatureFlagEnabled);

  return { isACLPEnabled };
};
