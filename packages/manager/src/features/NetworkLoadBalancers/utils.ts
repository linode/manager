import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

/**
 *
 * @returns an object that contains boolean property to check whether Network LoadBalancer is enabled or not
 */
export const useIsNetworkLoadBalancerEnabled = (): {
  isNetworkLoadBalancerEnabled: boolean;
} => {
  const { data: account } = useAccount();

  const isNetworkLoadBalancerEnabled = isFeatureEnabledV2(
    'Network LoadBalancer',
    true,
    account?.capabilities ?? []
  );

  return { isNetworkLoadBalancerEnabled };
};
