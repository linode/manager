import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';
import { isFeatureEnabled } from 'src/utilities/accountCapabilities';

/**
 * Hook to help determine if the Akamai Cloud Load Balancer should be shown.
 *
 * @returns true if Akamai Cloud Load Balancer should be shown for the current user
 */
export const useIsACLBEnabled = () => {
  const { data: account } = useAccount();
  const flags = useFlags();

  const isACLBEnabled = isFeatureEnabled(
    'Akamai Cloud Load Balancer',
    Boolean(flags.aglb),
    account?.capabilities ?? []
  );

  return { isACLBEnabled };
};
