import { useAccount } from '@linode/queries';
import { isFeatureEnabledV2 } from '@linode/utilities';

import { useFlags } from './useFlags';

import type { VPCIPv6 } from '@linode/api-v4';

export const useVPCDualStack = (ipv6?: VPCIPv6[]) => {
  const { data: account } = useAccount();
  const flags = useFlags();

  const isDualStackSelected = Boolean(ipv6 && ipv6.length > 0);

  const isDualStackEnabled = isFeatureEnabledV2(
    'VPC Dual Stack',
    Boolean(flags.vpcIpv6),
    account?.capabilities ?? []
  );

  const isEnterpriseCustomer = isFeatureEnabledV2(
    'VPC IPv6 Large Prefixes',
    Boolean(flags.vpcIpv6),
    account?.capabilities ?? []
  );

  const shouldDisplayIPv6 = isDualStackEnabled && isDualStackSelected;
  const recommendedIPv6 = shouldDisplayIPv6
    ? [
        {
          range: '/56',
        },
      ]
    : undefined;

  return {
    isDualStackEnabled,
    isDualStackSelected,
    isEnterpriseCustomer,
    shouldDisplayIPv6,
    recommendedIPv6,
  };
};
