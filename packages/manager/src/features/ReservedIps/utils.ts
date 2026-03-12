import { useFlags } from 'src/hooks/useFlags';

/**
 *
 * @returns an object that contains boolean property to check whether Reserved IP is enabled or not
 */
export const useIsReserveIpEnabled = () => {
  const flags = useFlags();

  // @TODO ReservedIps: check for customer tag/account capability when it exists

  return { isReserveIpEnabled: flags.reserveIp ?? false };
};
