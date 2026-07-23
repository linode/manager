import { useAccount } from '@linode/queries';

import { useFlags } from 'src/hooks/useFlags';

/**
 * Hook to determine if the NAT Gateway feature should be visible to the user.
 * Based on the user's account capability and the feature flag.
 *
 * @returns {boolean} isNATGatewaysEnabled - Whether NAT Gateways feature is enabled for the current user.
 * @returns {boolean} isNATGatewaysBeta - Whether NAT Gateways is in beta phase.
 */
export const useIsNATGatewaysEnabled = () => {
  const { data: account } = useAccount();
  const flags = useFlags();

  const hasNATGatewayCapability =
    account?.capabilities?.includes('NAT Gateway') ?? false;

  const isFlagEnabled = Boolean(flags.natgateway?.enabled);

  const isNATGatewaysEnabled = Boolean(
    hasNATGatewayCapability && isFlagEnabled
  );

  return {
    isNATGatewaysEnabled,
    isNATGatewaysBeta: flags.natgateway?.beta ?? false,
  };
};
