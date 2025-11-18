import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { useFlags } from 'src/hooks/useFlags';

/**
 *
 * @returns an object that contains boolean property to check whether Network LoadBalancer is enabled or not
 */
export const useIsNetworkLoadBalancerEnabled = (): {
  isNetworkLoadBalancerEnabled: boolean;
} => {
  const { data: account } = useAccount();
  const flags = useFlags();

  if (!flags) {
    return { isNetworkLoadBalancerEnabled: false };
  }

  const isNetworkLoadBalancerEnabled = isFeatureEnabledV2(
    'Network LoadBalancer',
    Boolean(flags.networkLoadBalancer),
    account?.capabilities ?? []
  );

  return { isNetworkLoadBalancerEnabled };
};

//Links
export const NLB_DOCS_LINK =
  'https://techdocs.akamai.com/linode-api/changelog/network-load-balancers';
