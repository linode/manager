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

export const convertStringToCamelCasesWithSpaces = (
  nonFormattedString: string
): string => {
  return nonFormattedString
    ?.split(' ')
    .map((text) => text.charAt(0).toUpperCase() + text.slice(1))
    .join(' ');
};

export const createObjectCopy = <T>(object: T): T | null => {
  if (!object) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    return null;
  }
};
