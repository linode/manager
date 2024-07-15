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
  if (nonFormattedString && nonFormattedString.length > 0) {
    const splitString = nonFormattedString.split(' ');

    return splitString
      .map((text) => text[0].toUpperCase() + text.slice(1))
      .join(' ');
  }

  return nonFormattedString;
};

export const removeObjectReference = (object: any) => {
  if (!object) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(object));
  } catch (e) {
    return null;
  }
};
