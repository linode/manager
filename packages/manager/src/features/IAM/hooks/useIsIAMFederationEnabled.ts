import { useFlags } from 'src/hooks/useFlags';

/**
 * Returns whether or not features related to the IAM Federation (SSO / External IdP) project
 * should be enabled.
 */
export const useIsIAMFederationEnabled = () => {
  const flags = useFlags();

  return {
    isIAMFederationEnabled: Boolean(flags.iamFederation),
  };
};
