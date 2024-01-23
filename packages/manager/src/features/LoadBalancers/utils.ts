import { useFlags } from 'src/hooks/useFlags';
import { useAccount } from 'src/queries/account';

/**
 * Hook to help determine if the Akamai Cloud Load Balancer should be shown.
 *
 * @returns true if Akamai Cloud Load Balancer should be shown for the current user
 */
export const useIsACLBEnabled = () => {
  const { data: account } = useAccount();
  const flags = useFlags();

  const isACLBEnabled =
    account?.capabilities.includes('Akamai Cloud Load Balancer') || flags.aglb;

  return { isACLBEnabled };
};
