import { useFlags } from 'src/hooks/useFlags';

/**
 * Hook to determine if the IAM feature should be visible to the user.
 * Based on the user's account capability and the feature flag.
 *
 * @returns {boolean} - Whether the IAM feature is enabled for the current user.
 */
export const useIsIAMEnabled = () => {
  const flags = useFlags();

  const isIAMEnabled = flags.iam?.enabled;

  return {
    isIAMBeta: flags.iam?.beta,
    isIAMEnabled,
  };
};

export const placeholderMap: Record<string, string> = {
  account: 'Select Account',
  database: 'Select Databases',
  domain: 'Select Domains',
  firewall: 'Select Firewalls',
  image: 'Select Images',
  linode: 'Select Linodes',
  longview: 'Select Longviews',
  nodebalancer: 'Select Nodebalancers',
  stackscript: 'Select Stackscripts',
  volume: 'Select Volumes',
  vpc: 'Select VPCs',
};
