import { useFlags } from 'src/hooks/useFlags';

/**
 * Returns whether features related to IAM 2FA enforcement should be enabled.
 */
export const useIsIAMTfaEnforcementEnabled = () => {
  const flags = useFlags();

  return {
    isIAMTfaEnforcementEnabled: Boolean(flags.iamTfaEnforcement),
  };
};
